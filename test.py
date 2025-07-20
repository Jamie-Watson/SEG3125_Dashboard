import pandas as pd
import numpy as np

def clean_and_process_csv(file_path, demographic_type):
    """
    Read and clean the CSV file, extracting the relevant data
    """
    # Read the CSV file with more flexible settings
    try:
        # First try to read with flexible settings
        df = pd.read_csv(file_path, encoding='utf-8', dtype=str, keep_default_na=False)
    except:
        try:
            # Try with different encoding
            df = pd.read_csv(file_path, encoding='latin-1', dtype=str, keep_default_na=False)
        except:
            # Last resort - read as text and parse manually
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
            
            # Parse manually
            data = []
            for line in lines:
                # Split by comma but handle quoted fields
                import csv
                reader = csv.reader([line])
                try:
                    row = next(reader)
                    data.append(row)
                except:
                    data.append([line.strip()])
            
            # Convert to DataFrame
            max_cols = max(len(row) for row in data) if data else 1
            for row in data:
                while len(row) < max_cols:
                    row.append('')
            
            df = pd.DataFrame(data)
    
    # Find the row that contains "Geography and institutions" - this is our header
    header_row = None
    for i in range(len(df)):
        for j in range(len(df.columns)):
            if pd.notna(df.iloc[i, j]) and "Geography and institutions" in str(df.iloc[i, j]):
                header_row = i
                break
        if header_row is not None:
            break
    
    if header_row is None:
        raise ValueError(f"Could not find header row in {file_path}")
    
    # Extract the actual data starting from the row after header
    data_start = header_row + 2  # Skip the "Number" row too
    
    # Get the year columns (excluding the first column which is institution names)
    header_data = df.iloc[header_row].tolist()
    years = [col for col in header_data[1:] if col and col.strip() and '/' in str(col)]
    
    # Create column names
    columns = ["Institution"] + years
    
    # Extract the data rows
    data_rows = []
    for i in range(data_start, len(df)):
        if i >= len(df):
            break
            
        row = df.iloc[i]
        # Skip empty rows
        if pd.isna(row.iloc[0]) or row.iloc[0] == "" or row.iloc[0].strip() == "":
            continue
        
        # Extract institution name and enrollment numbers
        institution = str(row.iloc[0]).strip().replace('"', '')
        
        # Skip if this looks like a header or metadata
        if any(keyword in institution.lower() for keyword in ['field of study', 'program type', 'credential', 'registration', 'status', 'gender']):
            continue
        
        values = [institution]
        
        # Get enrollment values for each year
        for j in range(1, len(years) + 1):
            if j < len(row):
                val = row.iloc[j]
                # Clean the value (remove commas, handle missing data)
                if pd.notna(val) and str(val).strip() != "":
                    try:
                        # Remove commas, quotes and convert to int
                        clean_val = str(val).replace(",", "").replace('"', '').strip()
                        if clean_val.isdigit():
                            values.append(int(clean_val))
                        else:
                            values.append(np.nan)
                    except ValueError:
                        values.append(np.nan)
                else:
                    values.append(np.nan)
            else:
                values.append(np.nan)
        
        # Only add if we have an institution name and at least one data point
        if len(values) > 1 and any(pd.notna(v) for v in values[1:]):
            data_rows.append(values)
    
    # Create DataFrame
    clean_df = pd.DataFrame(data_rows, columns=columns)
    
    # Add demographic type identifier
    clean_df['demographic_type'] = demographic_type
    
    return clean_df

def combine_enrollment_data(total_csv, men_csv, canadian_csv, output_csv):
    """
    Combine the three CSV files into one comprehensive dataset
    """
    
    # Process each CSV file
    print("Processing total enrollment data...")
    total_df = clean_and_process_csv(total_csv, 'total')
    
    print("Processing men enrollment data...")
    men_df = clean_and_process_csv(men_csv, 'men')
    
    print("Processing Canadian students data...")
    canadian_df = clean_and_process_csv(canadian_csv, 'canadian')
    
    # Get the year columns (all except Institution and demographic_type)
    year_columns = [col for col in total_df.columns if col not in ['Institution', 'demographic_type']]
    
    # Merge all dataframes on Institution
    print("Combining data...")
    
    # Start with total data
    combined_df = total_df[['Institution'] + year_columns].copy()
    
    # Add suffixes to distinguish the data types
    combined_df.columns = ['Institution'] + [f'Total_{year}' for year in year_columns]
    
    # Merge men data
    men_data = men_df[['Institution'] + year_columns]
    men_data.columns = ['Institution'] + [f'Men_{year}' for year in year_columns]
    combined_df = combined_df.merge(men_data, on='Institution', how='outer')
    
    # Merge Canadian data
    canadian_data = canadian_df[['Institution'] + year_columns]
    canadian_data.columns = ['Institution'] + [f'Canadian_{year}' for year in year_columns]
    combined_df = combined_df.merge(canadian_data, on='Institution', how='outer')
    
    # Calculate derived columns (Women and International students)
    for year in year_columns:
        # Women = Total - Men
        combined_df[f'Women_{year}'] = combined_df[f'Total_{year}'] - combined_df[f'Men_{year}']
        
        # International = Total - Canadian
        combined_df[f'International_{year}'] = combined_df[f'Total_{year}'] - combined_df[f'Canadian_{year}']
    
    # Reorder columns for better readability
    ordered_columns = ['Institution']
    for year in year_columns:
        ordered_columns.extend([
            f'Total_{year}',
            f'Men_{year}',
            f'Women_{year}',
            f'Canadian_{year}',
            f'International_{year}'
        ])
    
    combined_df = combined_df[ordered_columns]
    
    # Sort by institution name
    combined_df = combined_df.sort_values('Institution').reset_index(drop=True)
    
    # Save to CSV
    combined_df.to_csv(output_csv, index=False)
    print(f"Combined data saved to {output_csv}")
    
    # Display summary statistics
    print(f"\nSummary:")
    print(f"Total institutions: {len(combined_df)}")
    print(f"Years covered: {year_columns}")
    print(f"Data types included: Total, Men, Women, Canadian, International")
    
    return combined_df

# Example usage
if __name__ == "__main__":
    # Define your file paths
    total_csv_path = "C:\\Users\\iamie\Downloads\\3710023403-eng-total-total.csv"      # Replace with your total CSV file path
    men_csv_path = "C:\\Users\\iamie\\Downloads\\3710023403-eng-total-men.csv"         # Replace with your men CSV file path
    canadian_csv_path = "C:\\Users\\iamie\\Downloads\\3710023403-eng-total-canadian.csv" # Replace with your Canadian CSV file path
    output_csv_path = "combined_university_enrollment.csv"
    
    try:
        # Combine the data
        combined_data = combine_enrollment_data(
            total_csv_path, 
            men_csv_path, 
            canadian_csv_path, 
            output_csv_path
        )
        
        # Display first few rows as preview
        print("\nFirst 5 rows of combined data:")
        print(combined_data.head())
        
        # Show some sample statistics
        print(f"\nSample enrollment numbers for 2021/2022:")
        latest_year = "2021 / 2022"
        if f'Total_{latest_year}' in combined_data.columns:
            print(f"Total students: {combined_data[f'Total_{latest_year}'].sum():,}")
            print(f"Men: {combined_data[f'Men_{latest_year}'].sum():,}")
            print(f"Women: {combined_data[f'Women_{latest_year}'].sum():,}")
            print(f"Canadian: {combined_data[f'Canadian_{latest_year}'].sum():,}")
            print(f"International: {combined_data[f'International_{latest_year}'].sum():,}")
        
    except Exception as e:
        print(f"Error: {e}")
        print("Please check your file paths and ensure the CSV files are in the correct format.")