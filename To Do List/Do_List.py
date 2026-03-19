def print_header():
    print("*" * 75)
    print("*" + "Welcome Champion!".center(73) + "*")
    print("*" + "This Program will ensure and Manage your Daily Tasks".center(73) + "*")
    print("*" * 75)

def get_tasks():
    tasks = []
    times = []
    while True:
        task = input("Enter a task (or press Enter to finish): ")
        if task == "":
            break
        time = input("Enter estimated time for this task (e.g., '30minutes', '2hours'): ")
        tasks.append(task)
        times.append(time)
    return tasks, times

def main():
    print_header()
    task_list, task_timeline = get_tasks()
    task_status = ["Pending"] * len(task_list)

    while True:
        print("\nAvailable commands:")
        print("1. View tasks (v)")
        print("2. Mark task as complete (c)")
        print("3. Exit (exit)")
        
        operation = input("\nEnter command: ").lower()
        
        if operation == "exit":
            print("\nYou did it Champion, See you Again!")
            break
        elif operation == "v":
            print("\n" + "=" * 75)
            print(f"{'Task':<30}{'Time':<15}{'Status':<15}")
            print("-" * 75)
            for i in range(len(task_list)):
                print(f"{task_list[i]:<30}{task_timeline[i]:<15}{task_status[i]:<15}")
            print("=" * 75)
        elif operation == "c":
            print("\nCurrent tasks:")
            for i in range(len(task_list)):
                print(f"{i+1}. {task_list[i]} ({task_status[i]})")
            try:
                task_num = int(input("\nEnter task number to mark as complete: ")) - 1
                if 0 <= task_num < len(task_list):
                    task_status[task_num] = "Completed"
                    print(f"\n'{task_list[task_num]}' marked as completed!")
                else:
                    print("\nInvalid task number!")
            except ValueError:
                print("\nPlease enter a valid number!")
        else:
            print("\nInvalid command! Please try again.")

if __name__ == "__main__":
    main()
       