# # class Items:
# #     def __init__(self,name,price,weight):
# #         self.name = name
# #         self.price = price
# #         self.weight = weight
# #     def __repr__(self):
# #         return F"{self.name} - Price: {self.price}, Weight: {self.weight} K.g"
# # obj1 = Items("Laptop", 100000, 2.5 )
# # print(obj1)
# from dataclasses import dataclass
# @dataclass
# class Items:
#     name : str
#     _price : float
#     _weight : float
#     def __post_init__(self):
#         self.price = self._price
#         self.weight = self._weight
#     @property
#     def price(self):
#         return self ._price
    
#     @price.setter
#     def price(self, value):
#         if value < 0:
#             raise ValueError("Price cannot be negative")
#         self._price = value
    
#     @property
#     def weight(self):
#         return self._weight
    
#     @weight.setter
#     def weight(self, value1):
#         if value1 <= 0:
#             raise ValueError("Weight cannot be negative")
#         self._weight = value1

#     def get_cost_per_kg(self):
#         return self.price / self.weight

# obj = Items("Laptop", 100000, 2.5 )
# print(obj)
# print("Cost per K.g:", obj.get_cost_per_kg())

from dataclasses import dataclass
@dataclass
class Weapons:
    name : str
    damage : int
    range : int
class Players:
    def __init__(self, name, health,weapon):
        self.name = name
        self.health = health
        self.weapon = weapon
    
    def attack(self, other_player):
        other_player.health -= self.weapon.damage
        print(f"{self.name} attacked {other_player.name} with {self.weapon.name} causing {self.weapon.damage} damage.")
class Portion:
    def __init__(self, name, volume):
        self.name = name
        self.volume = volume
    
    def __str__(self):
        return f"{self.name} - Volume: {self.volume} ml"
    
    def __add__(self, other):
        total_volume = self.volume + other.volume
        return Portion(f"Combined Portion of {self.name} and {other.name}", total_volume)
obj= Weapons("Excalibur", 100 , 5)
obj1 = Weapons("Dagger", 80 , 15)
player_1 = Players("Arthur", 500, obj)
player_2 = Players("Lancelot", 450, obj1)
player_1.attack(player_2)
print(f"{player_1.name} Health: {player_1.health}")
player_2.attack(player_1)
print(f"{player_2.name} Health: {player_2.health}")
portion1 = Portion("Red", 50)
portion2 = Portion("Blue", 100)
combined_portion = portion1 + portion2
print(combined_portion)

