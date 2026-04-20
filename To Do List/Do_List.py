import streamlit as st
import pandas as pd
import numpy as np

def main():
    # 1. Initialize Context-Dependent Data
    # We check if 'df' exists in session_state to prevent crashes on refresh
    if 'df' not in st.session_state:
        # Using Pandas to create the initial structure
        st.session_state.df = pd.DataFrame(columns=['Task', 'Time', 'Status'])

    # 2. Web UI Elements
    st.title("🏆 Champion Task Manager")
    
    # Sidebar for Inputs
    with st.sidebar:
        st.header("Add New Task")
        task_input = st.text_input("What needs to be done?")
        time_input = st.number_input("Estimated Minutes", min_value=5, step=5)
        
        if st.button("Add to List"):
            if task_input:
                # Using Pandas to append data
                new_task = pd.DataFrame({
                    'Task': [task_input], 
                    'Time': [time_input], 
                    'Status': ['Pending']
                })
                st.session_state.df = pd.concat([st.session_state.df, new_task], ignore_index=True)
                st.success("Task added!")
            else:
                st.error("Please enter a task name.")

    # 3. Data Display & Logic
    if not st.session_state.df.empty:
        st.write("### Your Schedule")
        st.table(st.session_state.df)
        
        # NumPy Logic: Summing values from the DataFrame
        total_time = np.sum(st.session_state.df['Time'].values)
        st.metric("Total Workload", f"{total_time} mins")
    else:
        st.info("Your task list is empty. Add something in the sidebar!")

if __name__ == "__main__":
    # This block ensures the script only runs when called correctly
    main()