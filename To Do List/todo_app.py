import json
import os
from datetime import datetime

# --- COLORS ---
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[96m'
    PURPLE = '\033[95m'
    RESET = '\033[0m'

class TaskManager:
    def __init__(self):
        self.filename = "tasks.json"
        self.archive_file = "archive.json"
        self.tasks = self.load_tasks()
        
        # --- THE AUTOMATION ENGINE ---
        # This runs automatically every time you start the app
        self.run_daily_automation()

    def load_tasks(self):
        if not os.path.exists(self.filename): return []
        try:
            with open(self.filename, 'r') as file: return json.load(file)
        except: return []
        
    def save_tasks(self):
        with open(self.filename, 'w') as file:
            json.dump(self.tasks, file, indent=4)

    # --- AUTOMATION LOGIC ---
    def run_daily_automation(self):
        """
        1. Resets 'Daily' tasks if it's a new day.
        2. Archives 'One-time' completed tasks.
        """
        today = datetime.now().strftime("%Y-%m-%d")
        active_tasks = []
        archived_tasks = []
        changes_made = False

        print(f"{Colors.PURPLE}Running System Automation...{Colors.RESET}")

        for task in self.tasks:
            # Feature 1: Auto-Reset Daily Habits
            # If it's a 'daily' task, marked done, but the date stored is NOT today...
            if task.get('type') == 'daily' and task['status'] == 'Completed':
                if task.get('last_updated') != today:
                    task['status'] = 'Pending' # RESET IT!
                    task['last_updated'] = today
                    changes_made = True
                    active_tasks.append(task)
                else:
                    active_tasks.append(task) # It was done today, keep it as is
            
            # Feature 2: Auto-Archive One-Time Tasks
            # If it's a 'one-time' task and it is Completed... move to archive
            elif task.get('type') == 'one-time' and task['status'] == 'Completed':
                archived_tasks.append(task)
                changes_made = True
            
            else:
                active_tasks.append(task)

        # Apply changes
        if changes_made:
            self.tasks = active_tasks
            self.save_tasks()
            
            # Append archived tasks to archive.json
            if archived_tasks:
                self.save_to_archive(archived_tasks)
                print(f"{Colors.GREEN}>> Automation: {len(archived_tasks)} completed tasks moved to Archive.{Colors.RESET}")
                print(f"{Colors.GREEN}>> Automation: Daily habits reset for a new day.{Colors.RESET}")

    def save_to_archive(self, tasks_to_archive):
        existing_archive = []
        if os.path.exists(self.archive_file):
            try:
                with open(self.archive_file, 'r') as f: existing_archive = json.load(f)
            except: pass
        
        existing_archive.extend(tasks_to_archive)
        
        with open(self.archive_file, 'w') as f:
            json.dump(existing_archive, f, indent=4)

    # --- STANDARD APP FUNCTIONS ---
    def view_tasks(self):
        print(f"\n{Colors.BLUE}=== DASHBOARD ({datetime.now().strftime('%Y-%m-%d')}) ==={Colors.RESET}")
        
        # Sort: High Priority first, then Pending first
        # This is also an automation: Auto-Sorting!
        self.tasks.sort(key=lambda x: (x['status'] == 'Completed', x['priority'] != 'High'))

        print(f"{Colors.BLUE}┌{'─'*4}┬{'─'*30}┬{'─'*10}┬{'─'*12}┬{'─'*12}┐")
        print(f"│ {'ID':<2} │ {'TASK NAME':<28} │ {'TYPE':<8} │ {'PRIORITY':<10} │ {'STATUS':<10} │")
        print(f"├{'─'*4}┼{'─'*30}┼{'─'*10}┼{'─'*12}┼{'─'*12}┤{Colors.RESET}")

        for i, t in enumerate(self.tasks, 1):
            status_color = Colors.GREEN if t['status'] == 'Completed' else Colors.YELLOW
            p_color = Colors.RED if t['priority'] == 'High' else Colors.BLUE
            
            # Truncate Name
            name = (t['name'][:26] + '..') if len(t['name']) > 26 else t['name']
            task_type = "Daily" if t.get('type') == 'daily' else "Once"

            print(f"│ {i:<2} │ {name:<28} │ {task_type:<8} │ {p_color}{t['priority']:<10}{Colors.RESET} │ {status_color}{t['status']:<10}{Colors.RESET} │")

        print(f"{Colors.BLUE}└{'─'*4}┴{'─'*30}┴{'─'*10}┴{'─'*12}┴{'─'*12}┘{Colors.RESET}")

    def add_task(self):
        print(f"\n{Colors.BLUE}--- NEW ENTRY ---{Colors.RESET}")
        name = input("Task Name: ").strip()
        if not name: return
        
        prio = input("Priority (High/Med/Low): ").capitalize()
        
        # NEW INPUT: Task Type
        is_daily = input("Is this a recurring daily habit? (y/n): ").lower()
        t_type = "daily" if is_daily == 'y' else "one-time"

        self.tasks.append({
            "name": name, 
            "priority": prio, 
            "status": "Pending",
            "type": t_type,
            "last_updated": datetime.now().strftime("%Y-%m-%d")
        })
        self.save_tasks()
        print(f"{Colors.GREEN}Task Saved.{Colors.RESET}")

    def mark_completed(self):
        self.view_tasks()
        sel = input(f"\n{Colors.BLUE}Enter ID to complete: {Colors.RESET}")
        try:
            idx = int(sel) - 1
            if 0 <= idx < len(self.tasks):
                self.tasks[idx]['status'] = 'Completed'
                self.tasks[idx]['last_updated'] = datetime.now().strftime("%Y-%m-%d")
                self.save_tasks()
                print(f"{Colors.GREEN}Great job!{Colors.RESET}")
        except ValueError: pass

if __name__ == "__main__":
    app = TaskManager()
    while True:
        app.view_tasks()
        choice = input(f"\n{Colors.YELLOW}(A)dd  (C)omplete  (E)xit: {Colors.RESET}").lower()
        if choice == 'a': app.add_task()
        elif choice == 'c': app.mark_completed()
        elif choice == 'e': break