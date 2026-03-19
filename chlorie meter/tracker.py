#  Name- yuvraj singh soni
#  Date- 2025 24th october
# project - Calorie Meter CLI

meal_type = ["breakfast", "lunch", "dinner", "snacks"]  # list of all meals types...
calorie_correspondence = ["350", "600", "300", "150"]    # list of calories entries...
print("*********************************************************************")
print("***welcome candidate lets track today's calorie intake***")     #welcome greeting....
print("*********************************************************************")
user = ""
total_calories = 0
while True:
    user = input("press 'q' to quit and s for start tracking our calories:")       # this loop ask user' cammand to start / quit ...
    if user == 'q':
        print("Thank You !! have a nice day ..")
        break
    else:
        print("let's start tracking your calories .. ")
        print("***************************************************************")
        print("S.No     Meal Type                   Calories(kcals)")
        print(f'1.    \t{meal_type[0]}          \t\t{calorie_correspondence[0]} kcal')
        print(f'2.    \t{meal_type[1]}          \t\t\t{calorie_correspondence[1]} kcal')     #this displays the data of meal intake and its corresponding calories...
        print(f'3.    \t{meal_type[2]}          \t\t{calorie_correspondence[2]} kcal')
        print(f'4.    \t{meal_type[3]}          \t\t{calorie_correspondence[3]} kcal')
        print("****************************************************************")   

        total_calories = sum(int(cal) for cal in calorie_correspondence)
        avg_calories= total_calories / len(meal_type)
        print(f'total calories consumed: {total_calories} kcal\t\tAverage calorie intake: {avg_calories}')      #total calorie and avg calorie intake will be printed...
        print("****************************************************************") 
    gender_type = input("enter your gender(M/F): ")        # user gender as calorie intake is different for both the genders..
    height = float(input("enter your heights in cms: "))     #user height for BMR calculation...
    age = int(input("enter your age: "))                 #user age as calorie intake varies with age  ...      
    weight = float(input("enter your weight in kg: "))   #user weight for BMR calculation...
    if gender_type.upper() == 'M':
        # calorie requirement for men
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
        print(f"Estimated BMR (men): {bmr:.1f} kcal/day")    #{bmr:.1f} this will format the calorie requirement to one decimal place...
    else:
        # calorie requirement for women
        bmr = 10 * weight + 6.25 * height - 5 * age - 161           # calorie requiredment are vary for both the genders....
        print(f"Estimated BMR (women): {bmr:.1f} kcal/day")
    print("*****************************************************************")

    if total_calories > bmr:
        print("!! Warning !! you had exceeded your todays calorie intake..")
    else:
        print("You are within your recommended calorie intake today.")        
        print("Great !! you are within your calorie limit today...")
    print("******************************************************************")
    save=input("Do you want to save the session? (Y / N):")                # user's permission for saving the session...
    if save.upper() == 'Y':
        with open("calorie_log.txt", "a") as file:
            file.write(f'Total Calories: {total_calories} kcal, BMR: {bmr: 1f}')
            file.write('\n')
            print("session saved successfully..")
    else:
        print("session not saved..")
        
        
