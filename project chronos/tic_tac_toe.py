class TicTacToe:
    def __init__(self):
        # Step 1: The Board (Single list of 9 strings)
        self.board = [' ' for _ in range(9)] 
        self.current_winner = None # Keep track of winner!

    def print_board(self):
        # Step 3: The Visuals
        for i in [0, 3, 6]:
            row = self.board[i : i+3]
            print(' | '.join(row))
            if i < 6: 
                print("-" * 9)

    def print_board_nums(self):
        # HELPER: Prints a board with numbers 0-8 so users know what to type
        number_board = [[str(i) for i in range(j*3, (j+1)*3)] for j in range(3)]
        for row in number_board:
            print(' | '.join(row))

    def make_move(self, square, letter):
        # Step 4: Handle Input
        if self.board[square] == ' ':
            self.board[square] = letter
            if self.winner(square, letter):
                self.current_winner = letter
            return True
        return False

    def winner(self, square, letter):
        # Step 5: The Judge (Win Logic)
        
        # Check row
        row_ind = square // 3
        row = self.board[row_ind*3 : (row_ind + 1) * 3]
        if all([spot == letter for spot in row]):
            return True
            
        # Check column
        col_ind = square % 3
        column = [self.board[col_ind+i*3] for i in range(3)]
        if all([spot == letter for spot in column]):
            return True
            
        # Check diagonals (only if move is on an even index)
        if square % 2 == 0:
            diagonal1 = [self.board[i] for i in [0, 4, 8]]
            if all([spot == letter for spot in diagonal1]):
                return True
            diagonal2 = [self.board[i] for i in [2, 4, 6]]
            if all([spot == letter for spot in diagonal2]):
                return True
                
        return False

    def empty_squares(self):
        return ' ' in self.board

    def num_empty_squares(self):
        return self.board.count(' ')

def play(game, x_player, o_player, print_game=True):
    # Step 6: The Game Loop
    if print_game:
        game.print_board_nums()

    letter = 'X' # Starting letter
    
    # Iterate while the game still has empty squares
    while game.empty_squares():
        # Get input from user
        if letter == 'O':
            square = o_player(game)
        else:
            square = x_player(game)

        # Let's define the move
        if game.make_move(square, letter):
            if print_game:
                print(f'{letter} makes a move to square {square}')
                game.print_board()
                print('') # Empty line

            if game.current_winner:
                if print_game:
                    print(f'{letter} wins!')
                return letter  # Ends the loop and returns winner

            # Switch players
            letter = 'O' if letter == 'X' else 'X'

    if print_game:
        print('It\'s a tie!')

# --- Input Handling Helpers ---

def human_player(game):
    valid_square = False
    val = None
    while not valid_square:
        square = input(f'Choose move (0-8): ')
        try:
            val = int(square)
            if val not in range(9):
                raise ValueError
            if game.board[val] != ' ':
                print("Spot already taken.")
                continue
            valid_square = True
        except ValueError:
            print('Invalid input. Try again.')
    return val

# --- Main Execution ---
if __name__ == '__main__':
    t = TicTacToe()
    play(t, human_player, human_player, print_game=True)