from chatbot import Chatbot

def main():
    bot = Chatbot()

    while True:
        print("\n--- Chatbot Menu ---")
        print("1. Add a new question")
        print("2. Ask a question (and potentially record an answer)")
        print("3. List all questions and answers")
        print("4. Exit")
        print("--------------------")

        choice = input("Enter your choice: ")

        if choice == '1':
            question = input("Enter the new question: ")
            bot.add_question(question)
        elif choice == '2':
            question = input("Enter the question you want to ask: ")
            bot.ask_question_and_record_answer(question)
        elif choice == '3':
            bot.list_all_questions()
        elif choice == '4':
            print("Exiting chatbot. Goodbye!")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()