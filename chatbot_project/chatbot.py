import json
import uuid
from datetime import datetime

class Chatbot:
    def __init__(self, data_file='chatbot_data.json'):
        self.data_file = data_file
        self.assignments = []
        self.practice_questions = []
        self._load_data()

    def _load_data(self):
        try:
            with open(self.data_file, 'r') as f:
                data = json.load(f)
                self.assignments = data.get('assignments', [])
                self.practice_questions = data.get('practice_questions', [])
        except FileNotFoundError:
            pass # No data file yet, start with empty lists

    def _save_data(self):
        data = {
            'assignments': self.assignments,
            'practice_questions': self.practice_questions
        }
        with open(self.data_file, 'w') as f:
            json.dump(data, f, indent=4)

    def add_assignment(self, title, description, due_date):
        assignment = {
            'id': str(uuid.uuid4()),
            'title': title,
            'description': description,
            'due_date': due_date,
            'status': 'pending', # 'pending', 'in-progress', 'completed'
            'solution': None
        }
        self.assignments.append(assignment)
        self._save_data()
        print(f"Assignment '{title}' added with ID: {assignment['id']}")

    def update_assignment_status(self, assignment_id, status):
        for assignment in self.assignments:
            if assignment['id'] == assignment_id:
                assignment['status'] = status
                self._save_data()
                print(f"Assignment '{assignment['title']}' status updated to '{status}'.")
                return
        print(f"Assignment with ID '{assignment_id}' not found.")

    def submit_assignment_solution(self, assignment_id, solution):
        for assignment in self.assignments:
            if assignment['id'] == assignment_id:
                assignment['solution'] = solution
                assignment['status'] = 'completed' # Automatically mark as completed upon submission
                self._save_data()
                print(f"Solution submitted for assignment '{assignment['title']}'. Status set to 'completed'.")
                return
        print(f"Assignment with ID '{assignment_id}' not found.")

    def list_assignments(self):
        if not self.assignments:
            print("No assignments stored yet.")
            return

        print("\n--- Assignments ---")
        for assignment in self.assignments:
            print(f"ID: {assignment['id']}")
            print(f"Title: {assignment['title']}")
            print(f"Description: {assignment['description']}")
            print(f"Due Date: {assignment['due_date']}")
            print(f"Status: {assignment['status']}")
            print(f"Solution: {assignment['solution'] if assignment['solution'] else 'Not submitted'}")
            print("--------------------")

    def add_practice_question(self, question_text, correct_solution):
        practice_question = {
            'id': str(uuid.uuid4()),
            'question_text': question_text,
            'correct_solution': correct_solution,
            'attempts': [] # Each attempt will be {'user_answer': '...', 'is_correct': True/False, 'timestamp': '...'}
        }
        self.practice_questions.append(practice_question)
        self._save_data()
        print(f"Practice question added with ID: {practice_question['id']}")

    def attempt_practice_question(self, question_id, user_answer):
        for pq in self.practice_questions:
            if pq['id'] == question_id:
                is_correct = (user_answer == pq['correct_solution'])
                pq['attempts'].append({
                    'user_answer': user_answer,
                    'is_correct': is_correct,
                    'timestamp': datetime.now().isoformat()
                })
                self._save_data()
                print(f"Your answer: {user_answer}")
                print(f"Correct answer: {pq['correct_solution']}")
                if is_correct:
                    print("That's correct!")
                else:
                    print("That's incorrect.")
                return
        print(f"Practice question with ID '{question_id}' not found.")

    def list_practice_questions(self):
        if not self.practice_questions:
            print("No practice questions stored yet.")
            return

        print("\n--- Practice Questions ---")
        for pq in self.practice_questions:
            print(f"ID: {pq['id']}")
            print(f"Question: {pq['question_text']}")
            print(f"Correct Solution: {pq['correct_solution']}")
            print("Attempts:")
            if pq['attempts']:
                for attempt in pq['attempts']:
                    print(f"  - User Answer: {attempt['user_answer']}, Correct: {attempt['is_correct']}, Time: {attempt['timestamp']}")
            print("--------------------")

    def analyze_task(self, text):
        # Basic keyword extraction by splitting words
        words = [word.lower() for word in text.split() if word.isalpha()]
        return words

    def generate_predictive_report(self):
        print("\n--- Predictive Analysis Report ---")

        # Report on Assignments
        print("\nAssignments Overview:")
        total_assignments = len(self.assignments)
        pending = sum(1 for a in self.assignments if a['status'] == 'pending')
        in_progress = sum(1 for a in self.assignments if a['status'] == 'in-progress')
        completed = sum(1 for a in self.assignments if a['status'] == 'completed')

        print(f"Total Assignments: {total_assignments}")
        print(f"Pending: {pending}")
        print(f"In Progress: {in_progress}")
        print(f"Completed: {completed}")

        # Report on Practice Questions
        print("\nPractice Questions Performance:")
        if not self.practice_questions:
            print("No practice questions to analyze.")
        else:
            total_attempts = 0
            correct_attempts = 0
            question_performance = {}

            for pq in self.practice_questions:
                pq_total_attempts = len(pq['attempts'])
                pq_correct_attempts = sum(1 for att in pq['attempts'] if att['is_correct'])
                total_attempts += pq_total_attempts
                correct_attempts += pq_correct_attempts
                
                if pq_total_attempts > 0:
                    accuracy = (pq_correct_attempts / pq_total_attempts) * 100
                    question_performance[pq['question_text']] = {'accuracy': accuracy, 'attempts': pq_total_attempts}
                else:
                    question_performance[pq['question_text']] = {'accuracy': 0, 'attempts': 0}

            print(f"Total Practice Attempts: {total_attempts}")
            if total_attempts > 0:
                overall_accuracy = (correct_attempts / total_attempts) * 100
                print(f"Overall Practice Accuracy: {overall_accuracy:.2f}%")
            else:
                print("Overall Practice Accuracy: N/A")
            
            print("\nIndividual Question Performance:")
            for q_text, perf in question_performance.items():
                print(f"- {q_text}: {perf['accuracy']:.2f}% accurate over {perf['attempts']} attempts")

            # Suggest areas of focus (very basic)
            struggling_questions = [q for q, perf in question_performance.items() if perf['accuracy'] < 70 and perf['attempts'] > 0]
            if struggling_questions:
                print("\nSuggested Areas of Focus (based on low accuracy):")
                for sq in struggling_questions:
                    print(f"- {sq}")
            else:
                print("\nKeep up the good work! No specific struggling areas identified (or not enough attempts).")

        print("------------------------------------")


