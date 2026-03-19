import json

class Chatbot:
    def __init__(self, data_file='chatbot_data.json'):
        self.data_file = data_file
        self.questions_answers = self._load_data()

    def _load_data(self):
        try:
            with open(self.data_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {}

    def _save_data(self):
        with open(self.data_file, 'w') as f:
            json.dump(self.questions_answers, f, indent=4)

    def add_question(self, question, answer=None):
        self.questions_answers[question] = answer
        self._save_data()
        print(f"Question '{question}' added.")

    def get_answer(self, question):
        return self.questions_answers.get(question, "Sorry, I don't have an answer for that question yet.")

    def list_all_questions(self):
        if not self.questions_answers:
            print("No questions stored yet.")
            return

        print("\n--- Stored Questions and Answers ---")
        for question, answer in self.questions_answers.items():
            print(f"Question: {question}")
            print(f"Answer: {answer if answer is not None else 'Not set yet'}")
        print("------------------------------------")

    def ask_question_and_record_answer(self, question):
        if question in self.questions_answers and self.questions_answers[question] is not None:
            print(f"Question: {question}")
            print(f"Current Answer: {self.questions_answers[question]}")
            user_input = input("Would you like to update the answer? (y/n): ").lower()
            if user_input == 'y':
                new_answer = input("Your new answer: ")
                self.questions_answers[question] = new_answer
                self._save_data()
                print("Answer updated successfully.")
            else:
                print("Answer not updated.")
        else:
            answer = input(f"Please provide an answer for '{question}': ")
            self.questions_answers[question] = answer
            self._save_data()
            print("Answer recorded successfully.")