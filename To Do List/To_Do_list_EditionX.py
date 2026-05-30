def header():
    print("=" * 70)
    print("-" + 'Welcome to Daily Task Manager'.center(70) + "-")
    print("-" + 'Let your Discipline Meets efficiency to Achieve your Goals'.center(70) + "-")
    print("=" * 70)

def user_task():
    tasks = []
    times = []
    while True:
        task = input("Add Task :")
        if task == "":
            break
        time_est = input("Add the estimated time for the task :")
        tasks.append(task)
        times.append(time_est)
    return tasks, times

def main():
    header()
    task_list, task_time = user_task()
    task_status = ["pending"] * len(task_list)
    while True:
        print("\nAvailable Commands:")
        print("1. view tasks (v)")
        print("2. mark for completion (c)")
        print("3. exit (exit)")
        operation = input("\nEnter Command: ")
        if operation == "exit":
            print("\nYou Did it Champion See you Again!")
            break
        elif operation == "v":
            print("\n" + "=" * 80)
            print(f'{"Task":<50}{"Est. Time":<20}{"Status":<20}')
            for t, estt, ts in zip(task_list, task_time, task_status):
                print(f'{t:<50}{estt:<20}{ts:<10}')
                print("=" * 80)
        elif operation == "c":
            print("\nCurrent Tasks :")
            for i, (t, ts) in enumerate(zip(task_list, task_status), start=1):
                print(f'{i},{t},{ts} ')
            try:
                choice = input("\nEnter task number to mark complete (or press Enter to cancel): ")
                if choice.strip() == "":
                    print("Cancelled.")
                    continue
                idx = int(choice)
                if idx < 1 or idx > len(task_list):
                    print("Invalid task number.")
                    continue
                task_status[idx - 1] = "completed"
                print(f'Task "{task_list[idx - 1]}" marked as completed.')
            except ValueError:
                print("Please enter a valid integer for the task number.")
            except IndexError:
                print("Task number out of range.")
            except Exception as e:
                print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    main()
                





    
    