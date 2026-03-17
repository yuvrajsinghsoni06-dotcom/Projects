class Star:
    def __init__(self, rows, cols):
        self.rows = rows
        self.cols = cols

    def right_angle_triangle(self):
        for i in range(self.rows):
            for j in range(i + 1):
                print("*", end=" ")
            print()

    def square(self):
        for i in range(self.rows):
            for j in range(self.cols):
                print("*", end=" ")
            print()

    def rectangle(self):
        for i in range(self.rows):
            for j in range(self.cols + 2):
                print("*", end=" ")
            print()

    def hollow_square(self):
        for i in range(self.rows):
            for j in range(self.cols):
                if i == 0 or i == self.rows - 1 or j == 0 or j == self.cols - 1:
                    print("*", end=" ")
                else:
                    print(" ", end=" ")
            print()


s = Star(4, 5)
s.right_angle_triangle()
print()

s.square()
print()

s.rectangle()
print()

s.hollow_square()
