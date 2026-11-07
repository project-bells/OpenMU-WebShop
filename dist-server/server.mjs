// server.ts
import crypto7 from "crypto";
import dotenv from "dotenv";
import express from "express";
import path2 from "path";

// src/server/auditLogger.ts
import crypto2 from "crypto";
import fs from "fs";
import path from "path";

// src/data/webshopItems.ts
var INITIAL_WEBSHOP_ITEMS = [
  {
    "uid": 1,
    "id": 0,
    "name": "Kris",
    "credits": 6,
    "X": 1,
    "Y": 2,
    "type": 0,
    "ex_type": 0,
    "str": 40,
    "agi": 40,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00000000.gif",
    "exlThumb": "/items/10000000.gif"
  },
  {
    "uid": 2,
    "id": 1,
    "name": "Short Sword",
    "credits": 3,
    "X": 1,
    "Y": 3,
    "type": 0,
    "ex_type": 0,
    "str": 60,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00010000.gif",
    "exlThumb": "/items/10010000.gif"
  },
  {
    "uid": 3,
    "id": 2,
    "name": "Rapier",
    "credits": 9,
    "X": 1,
    "Y": 3,
    "type": 0,
    "ex_type": 0,
    "str": 50,
    "agi": 40,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00020000.gif",
    "exlThumb": "/items/10020000.gif"
  },
  {
    "uid": 4,
    "id": 3,
    "name": "Katana",
    "credits": 16,
    "X": 1,
    "Y": 3,
    "type": 0,
    "ex_type": 0,
    "str": 80,
    "agi": 40,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00030000.gif",
    "exlThumb": "/items/10030000.gif"
  },
  {
    "uid": 5,
    "id": 4,
    "name": "Sword of Assassin",
    "credits": 12,
    "X": 1,
    "Y": 3,
    "type": 0,
    "ex_type": 0,
    "str": 60,
    "agi": 40,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00040000.gif",
    "exlThumb": "/items/10040000.gif"
  },
  {
    "uid": 6,
    "id": 5,
    "name": "Blade",
    "credits": 32,
    "X": 1,
    "Y": 3,
    "type": 0,
    "ex_type": 0,
    "str": 80,
    "agi": 50,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 2,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00050000.gif",
    "exlThumb": "/items/10050000.gif"
  },
  {
    "uid": 7,
    "id": 6,
    "name": "Gladius",
    "credits": 20,
    "X": 1,
    "Y": 3,
    "type": 0,
    "ex_type": 0,
    "str": 110,
    "agi": 0,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00060000.gif",
    "exlThumb": "/items/10060000.gif"
  },
  {
    "uid": 8,
    "id": 7,
    "name": "Falchion",
    "credits": 24,
    "X": 1,
    "Y": 3,
    "type": 0,
    "ex_type": 0,
    "str": 120,
    "agi": 0,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00070000.gif",
    "exlThumb": "/items/10070000.gif"
  },
  {
    "uid": 9,
    "id": 8,
    "name": "Serpent Sword",
    "credits": 30,
    "X": 1,
    "Y": 3,
    "type": 0,
    "ex_type": 0,
    "str": 130,
    "agi": 0,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00080000.gif",
    "exlThumb": "/items/10080000.gif"
  },
  {
    "uid": 10,
    "id": 9,
    "name": "Sword of Salamander",
    "credits": 32,
    "X": 2,
    "Y": 3,
    "type": 0,
    "ex_type": 0,
    "str": 103,
    "agi": 0,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00090000.gif",
    "exlThumb": "/items/10090000.gif"
  },
  {
    "uid": 11,
    "id": 10,
    "name": "Light Saber",
    "credits": 40,
    "X": 2,
    "Y": 4,
    "type": 0,
    "ex_type": 0,
    "str": 80,
    "agi": 60,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/000A0000.gif",
    "exlThumb": "/items/100A0000.gif"
  },
  {
    "uid": 12,
    "id": 11,
    "name": "Legendary Sword",
    "credits": 44,
    "X": 2,
    "Y": 3,
    "type": 0,
    "ex_type": 0,
    "str": 120,
    "agi": 0,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/000B0000.gif",
    "exlThumb": "/items/100B0000.gif"
  },
  {
    "uid": 13,
    "id": 12,
    "name": "Heliacal Sword",
    "credits": 56,
    "X": 2,
    "Y": 3,
    "type": 0,
    "ex_type": 0,
    "str": 140,
    "agi": 0,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/000C0000.gif",
    "exlThumb": "/items/100C0000.gif"
  },
  {
    "uid": 14,
    "id": 13,
    "name": "Double Blade",
    "credits": 48,
    "X": 1,
    "Y": 3,
    "type": 0,
    "ex_type": 0,
    "str": 70,
    "agi": 70,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/000D0000.gif",
    "exlThumb": "/items/100D0000.gif"
  },
  {
    "uid": 15,
    "id": 14,
    "name": "Lighting Sword",
    "credits": 59,
    "X": 1,
    "Y": 3,
    "type": 0,
    "ex_type": 0,
    "str": 90,
    "agi": 50,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/000E0000.gif",
    "exlThumb": "/items/100E0000.gif"
  },
  {
    "uid": 16,
    "id": 15,
    "name": "Giant Sword",
    "credits": 52,
    "X": 2,
    "Y": 3,
    "type": 0,
    "ex_type": 0,
    "str": 140,
    "agi": 0,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/000F0000.gif",
    "exlThumb": "/items/100F0000.gif"
  },
  {
    "uid": 17,
    "id": 16,
    "name": "Sword of Destruction",
    "credits": 82,
    "X": 1,
    "Y": 4,
    "type": 0,
    "ex_type": 0,
    "str": 160,
    "agi": 60,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00100000.gif",
    "exlThumb": "/items/10100000.gif"
  },
  {
    "uid": 18,
    "id": 17,
    "name": "Dark Breaker",
    "credits": 104,
    "X": 2,
    "Y": 4,
    "type": 0,
    "ex_type": 0,
    "str": 180,
    "agi": 50,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00110000.gif",
    "exlThumb": "/items/10110000.gif"
  },
  {
    "uid": 19,
    "id": 18,
    "name": "Thunder Blade",
    "credits": 105,
    "X": 2,
    "Y": 3,
    "type": 0,
    "ex_type": 0,
    "str": 180,
    "agi": 50,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00120000.gif",
    "exlThumb": "/items/10120000.gif"
  },
  {
    "uid": 20,
    "id": 19,
    "name": "Divine Sword of ArchAngel",
    "credits": 86,
    "X": 1,
    "Y": 4,
    "type": 0,
    "ex_type": 0,
    "str": 140,
    "agi": 50,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00130000.gif",
    "exlThumb": "/items/10130000.gif"
  },
  {
    "uid": 21,
    "id": 20,
    "name": "Knight Blade",
    "credits": 140,
    "X": 1,
    "Y": 4,
    "type": 0,
    "ex_type": 0,
    "str": 116,
    "agi": 38,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00140000.gif",
    "exlThumb": "/items/10140000.gif"
  },
  {
    "uid": 22,
    "id": 21,
    "name": "Black Reign Blade",
    "credits": 140,
    "X": 2,
    "Y": 4,
    "type": 0,
    "ex_type": 0,
    "str": 116,
    "agi": 53,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00150000.gif",
    "exlThumb": "/items/10150000.gif"
  },
  {
    "uid": 23,
    "id": 22,
    "name": "Bone Blade",
    "credits": 147,
    "X": 1,
    "Y": 4,
    "type": 0,
    "ex_type": 0,
    "str": 100,
    "agi": 35,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00160000.gif",
    "exlThumb": "/items/10160000.gif"
  },
  {
    "uid": 24,
    "id": 23,
    "name": "Explosion Blade",
    "credits": 147,
    "X": 2,
    "Y": 4,
    "type": 0,
    "ex_type": 0,
    "str": 98,
    "agi": 48,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00170000.gif",
    "exlThumb": "/items/10170000.gif"
  },
  {
    "uid": 25,
    "id": 24,
    "name": "Day Braker",
    "credits": 130,
    "X": 2,
    "Y": 4,
    "type": 0,
    "ex_type": 0,
    "str": 144,
    "agi": 26,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00180000.gif",
    "exlThumb": "/items/10180000.gif"
  },
  {
    "uid": 26,
    "id": 25,
    "name": "Harbringer",
    "credits": 130,
    "X": 2,
    "Y": 4,
    "type": 0,
    "ex_type": 0,
    "str": 136,
    "agi": 57,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00190000.gif",
    "exlThumb": "/items/10190000.gif"
  },
  {
    "uid": 27,
    "id": 31,
    "name": "Rune Blade",
    "credits": 100,
    "X": 2,
    "Y": 4,
    "type": 0,
    "ex_type": 0,
    "str": 135,
    "agi": 62,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/001F0000.gif",
    "exlThumb": "/items/101F0000.gif"
  },
  {
    "uid": 28,
    "id": 0,
    "name": "Small Axe",
    "credits": 1,
    "X": 1,
    "Y": 3,
    "type": 1,
    "ex_type": 0,
    "str": 50,
    "agi": 0,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 1,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00200000.gif",
    "exlThumb": "/items/10200000.gif"
  },
  {
    "uid": 29,
    "id": 1,
    "name": "Hand Axe",
    "credits": 4,
    "X": 1,
    "Y": 3,
    "type": 1,
    "ex_type": 0,
    "str": 70,
    "agi": 0,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 1,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00210000.gif",
    "exlThumb": "/items/10210000.gif"
  },
  {
    "uid": 30,
    "id": 2,
    "name": "Double Axe",
    "credits": 14,
    "X": 1,
    "Y": 3,
    "type": 1,
    "ex_type": 0,
    "str": 90,
    "agi": 0,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 1,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00220000.gif",
    "exlThumb": "/items/10220000.gif"
  },
  {
    "uid": 31,
    "id": 3,
    "name": "Tomahawk",
    "credits": 18,
    "X": 1,
    "Y": 3,
    "type": 1,
    "ex_type": 0,
    "str": 100,
    "agi": 0,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 1,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00230000.gif",
    "exlThumb": "/items/10230000.gif"
  },
  {
    "uid": 32,
    "id": 4,
    "name": "Elven Axe",
    "credits": 26,
    "X": 1,
    "Y": 3,
    "type": 1,
    "ex_type": 0,
    "str": 50,
    "agi": 70,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 1,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00240000.gif",
    "exlThumb": "/items/10240000.gif"
  },
  {
    "uid": 33,
    "id": 5,
    "name": "Battle Axe",
    "credits": 30,
    "X": 2,
    "Y": 3,
    "type": 1,
    "ex_type": 0,
    "str": 120,
    "agi": 0,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 1,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00250000.gif",
    "exlThumb": "/items/10250000.gif"
  },
  {
    "uid": 34,
    "id": 6,
    "name": "Nikea Axe",
    "credits": 34,
    "X": 2,
    "Y": 3,
    "type": 1,
    "ex_type": 0,
    "str": 130,
    "agi": 0,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 1,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00260000.gif",
    "exlThumb": "/items/10260000.gif"
  },
  {
    "uid": 35,
    "id": 7,
    "name": "Larkan Axe",
    "credits": 46,
    "X": 2,
    "Y": 3,
    "type": 1,
    "ex_type": 0,
    "str": 140,
    "agi": 0,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 1,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00270000.gif",
    "exlThumb": "/items/10270000.gif"
  },
  {
    "uid": 36,
    "id": 8,
    "name": "Cresent Axe",
    "credits": 54,
    "X": 2,
    "Y": 3,
    "type": 1,
    "ex_type": 0,
    "str": 100,
    "agi": 40,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 1,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00280000.gif",
    "exlThumb": "/items/10280000.gif"
  },
  {
    "uid": 37,
    "id": 0,
    "name": "Mace",
    "credits": 7,
    "X": 1,
    "Y": 3,
    "type": 2,
    "ex_type": 0,
    "str": 100,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 2,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00400000.gif",
    "exlThumb": "/items/10400000.gif"
  },
  {
    "uid": 38,
    "id": 1,
    "name": "Morning Star",
    "credits": 13,
    "X": 1,
    "Y": 3,
    "type": 2,
    "ex_type": 0,
    "str": 100,
    "agi": 0,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 2,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00410000.gif",
    "exlThumb": "/items/10410000.gif"
  },
  {
    "uid": 39,
    "id": 2,
    "name": "Flail",
    "credits": 22,
    "X": 1,
    "Y": 3,
    "type": 2,
    "ex_type": 0,
    "str": 80,
    "agi": 50,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 2,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00420000.gif",
    "exlThumb": "/items/10420000.gif"
  },
  {
    "uid": 40,
    "id": 3,
    "name": "Great Hammer",
    "credits": 38,
    "X": 2,
    "Y": 3,
    "type": 2,
    "ex_type": 0,
    "str": 150,
    "agi": 0,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 2,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00430000.gif",
    "exlThumb": "/items/10430000.gif"
  },
  {
    "uid": 41,
    "id": 4,
    "name": "Crystal Morning Star",
    "credits": 66,
    "X": 2,
    "Y": 3,
    "type": 2,
    "ex_type": 0,
    "str": 130,
    "agi": 0,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 2,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00440000.gif",
    "exlThumb": "/items/10440000.gif"
  },
  {
    "uid": 42,
    "id": 5,
    "name": "Crystal Sword",
    "credits": 72,
    "X": 2,
    "Y": 4,
    "type": 2,
    "ex_type": 0,
    "str": 130,
    "agi": 70,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 2,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00450000.gif",
    "exlThumb": "/items/10450000.gif"
  },
  {
    "uid": 43,
    "id": 6,
    "name": "Chaos Dragon Axe",
    "credits": 75,
    "X": 2,
    "Y": 4,
    "type": 2,
    "ex_type": 0,
    "str": 140,
    "agi": 50,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 2,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00460000.gif",
    "exlThumb": "/items/10460000.gif"
  },
  {
    "uid": 44,
    "id": 7,
    "name": "Elemental Mace",
    "credits": 90,
    "X": 1,
    "Y": 3,
    "type": 2,
    "ex_type": 0,
    "str": 15,
    "agi": 42,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 2,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00470000.gif",
    "exlThumb": "/items/10470000.gif"
  },
  {
    "uid": 45,
    "id": 8,
    "name": "Battle Scepter",
    "credits": 54,
    "X": 1,
    "Y": 3,
    "type": 2,
    "ex_type": 0,
    "str": 80,
    "agi": 17,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 2,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00480000.gif",
    "exlThumb": "/items/10480000.gif"
  },
  {
    "uid": 46,
    "id": 9,
    "name": "Master Scepter",
    "credits": 72,
    "X": 1,
    "Y": 3,
    "type": 2,
    "ex_type": 0,
    "str": 87,
    "agi": 18,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 2,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00490000.gif",
    "exlThumb": "/items/10490000.gif"
  },
  {
    "uid": 47,
    "id": 10,
    "name": "Great Scepter",
    "credits": 82,
    "X": 1,
    "Y": 4,
    "type": 2,
    "ex_type": 0,
    "str": 100,
    "agi": 21,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 2,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/004A0000.gif",
    "exlThumb": "/items/104A0000.gif"
  },
  {
    "uid": 48,
    "id": 11,
    "name": "Lord Scepter",
    "credits": 98,
    "X": 1,
    "Y": 4,
    "type": 2,
    "ex_type": 0,
    "str": 105,
    "agi": 23,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 2,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/004B0000.gif",
    "exlThumb": "/items/104B0000.gif"
  },
  {
    "uid": 49,
    "id": 12,
    "name": "Great Lord Scepter",
    "credits": 140,
    "X": 1,
    "Y": 4,
    "type": 2,
    "ex_type": 0,
    "str": 90,
    "agi": 20,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 2,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/004C0000.gif",
    "exlThumb": "/items/104C0000.gif"
  },
  {
    "uid": 50,
    "id": 13,
    "name": "Scepter of Archangel",
    "credits": 120,
    "X": 1,
    "Y": 4,
    "type": 2,
    "ex_type": 0,
    "str": 75,
    "agi": 16,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 2,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/004D0000.gif",
    "exlThumb": "/items/104D0000.gif"
  },
  {
    "uid": 51,
    "id": 14,
    "name": "Solay Scepter",
    "credits": 146,
    "X": 1,
    "Y": 4,
    "type": 2,
    "ex_type": 0,
    "str": 80,
    "agi": 15,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 2,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/004E0000.gif",
    "exlThumb": "/items/104E0000.gif"
  },
  {
    "uid": 52,
    "id": 15,
    "name": "Scepter of Light",
    "credits": 180,
    "X": 1,
    "Y": 4,
    "type": 2,
    "ex_type": 0,
    "str": 108,
    "agi": 22,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 2,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/004F0000.gif",
    "exlThumb": "/items/104F0000.gif"
  },
  {
    "uid": 53,
    "id": 0,
    "name": "Light Spear",
    "credits": 42,
    "X": 2,
    "Y": 4,
    "type": 3,
    "ex_type": 0,
    "str": 60,
    "agi": 70,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 3,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00600000.gif",
    "exlThumb": "/items/00600000.gif"
  },
  {
    "uid": 54,
    "id": 1,
    "name": "Spear",
    "credits": 23,
    "X": 2,
    "Y": 4,
    "type": 3,
    "ex_type": 0,
    "str": 70,
    "agi": 50,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 3,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00610000.gif",
    "exlThumb": "/items/00610000.gif"
  },
  {
    "uid": 55,
    "id": 2,
    "name": "Dragon Lance",
    "credits": 15,
    "X": 2,
    "Y": 4,
    "type": 3,
    "ex_type": 0,
    "str": 70,
    "agi": 50,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 3,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00620000.gif",
    "exlThumb": "/items/00620000.gif"
  },
  {
    "uid": 56,
    "id": 3,
    "name": "Giant Trident",
    "credits": 29,
    "X": 2,
    "Y": 4,
    "type": 3,
    "ex_type": 0,
    "str": 90,
    "agi": 30,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 3,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00630000.gif",
    "exlThumb": "/items/00630000.gif"
  },
  {
    "uid": 57,
    "id": 4,
    "name": "Serpent Spear",
    "credits": 46,
    "X": 2,
    "Y": 4,
    "type": 3,
    "ex_type": 0,
    "str": 90,
    "agi": 30,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 3,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00640000.gif",
    "exlThumb": "/items/00640000.gif"
  },
  {
    "uid": 58,
    "id": 5,
    "name": "Double Poleaxe",
    "credits": 13,
    "X": 2,
    "Y": 4,
    "type": 3,
    "ex_type": 0,
    "str": 70,
    "agi": 50,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 3,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00650000.gif",
    "exlThumb": "/items/00650000.gif"
  },
  {
    "uid": 59,
    "id": 6,
    "name": "Halberd",
    "credits": 19,
    "X": 2,
    "Y": 4,
    "type": 3,
    "ex_type": 0,
    "str": 70,
    "agi": 50,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 3,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00660000.gif",
    "exlThumb": "/items/00660000.gif"
  },
  {
    "uid": 60,
    "id": 7,
    "name": "Berdysh",
    "credits": 37,
    "X": 2,
    "Y": 4,
    "type": 3,
    "ex_type": 0,
    "str": 80,
    "agi": 50,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 3,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00670000.gif",
    "exlThumb": "/items/00670000.gif"
  },
  {
    "uid": 61,
    "id": 8,
    "name": "Great Scythe",
    "credits": 54,
    "X": 2,
    "Y": 4,
    "type": 3,
    "ex_type": 0,
    "str": 90,
    "agi": 50,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 3,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00680000.gif",
    "exlThumb": "/items/10680000.gif"
  },
  {
    "uid": 62,
    "id": 9,
    "name": "Bill of Balrog",
    "credits": 63,
    "X": 2,
    "Y": 4,
    "type": 3,
    "ex_type": 0,
    "str": 80,
    "agi": 50,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 3,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00690000.gif",
    "exlThumb": "/items/10690000.gif"
  },
  {
    "uid": 63,
    "id": 10,
    "name": "Dragon Spear",
    "credits": 92,
    "X": 2,
    "Y": 4,
    "type": 3,
    "ex_type": 0,
    "str": 170,
    "agi": 60,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 3,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/006A0000.gif",
    "exlThumb": "/items/106A0000.gif"
  },
  {
    "uid": 64,
    "id": 0,
    "name": "Short Bow",
    "credits": 2,
    "X": 2,
    "Y": 3,
    "type": 4,
    "ex_type": 0,
    "str": 20,
    "agi": 80,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 4,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00800000.gif",
    "exlThumb": "/items/00800000.gif"
  },
  {
    "uid": 65,
    "id": 1,
    "name": "Bow",
    "credits": 8,
    "X": 2,
    "Y": 3,
    "type": 4,
    "ex_type": 0,
    "str": 30,
    "agi": 90,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 4,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00810000.gif",
    "exlThumb": "/items/00810000.gif"
  },
  {
    "uid": 66,
    "id": 2,
    "name": "Elven Bow",
    "credits": 16,
    "X": 2,
    "Y": 3,
    "type": 4,
    "ex_type": 0,
    "str": 30,
    "agi": 90,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 4,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00820000.gif",
    "exlThumb": "/items/00820000.gif"
  },
  {
    "uid": 67,
    "id": 3,
    "name": "Battle Bow",
    "credits": 26,
    "X": 2,
    "Y": 3,
    "type": 4,
    "ex_type": 0,
    "str": 30,
    "agi": 90,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 4,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00830000.gif",
    "exlThumb": "/items/00830000.gif"
  },
  {
    "uid": 68,
    "id": 4,
    "name": "Tiger Bow",
    "credits": 40,
    "X": 2,
    "Y": 4,
    "type": 4,
    "ex_type": 0,
    "str": 30,
    "agi": 100,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 4,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00840000.gif",
    "exlThumb": "/items/00840000.gif"
  },
  {
    "uid": 69,
    "id": 5,
    "name": "Silver Bow",
    "credits": 56,
    "X": 2,
    "Y": 4,
    "type": 4,
    "ex_type": 0,
    "str": 30,
    "agi": 100,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 4,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00850000.gif",
    "exlThumb": "/items/00850000.gif"
  },
  {
    "uid": 70,
    "id": 6,
    "name": "Chaos Nature Bow",
    "credits": 75,
    "X": 2,
    "Y": 4,
    "type": 4,
    "ex_type": 0,
    "str": 40,
    "agi": 150,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 4,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00860000.gif",
    "exlThumb": "/items/00860000.gif"
  },
  {
    "uid": 71,
    "id": 7,
    "name": "Bolt",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 4,
    "ex_type": 0,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 4,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00870000.gif",
    "exlThumb": "/items/00870000.gif"
  },
  {
    "uid": 72,
    "id": 8,
    "name": "Crossbow",
    "credits": 4,
    "X": 2,
    "Y": 2,
    "type": 4,
    "ex_type": 0,
    "str": 20,
    "agi": 90,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 4,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00880000.gif",
    "exlThumb": "/items/00880000.gif"
  },
  {
    "uid": 73,
    "id": 9,
    "name": "Golden Crossbow",
    "credits": 12,
    "X": 2,
    "Y": 2,
    "type": 4,
    "ex_type": 0,
    "str": 30,
    "agi": 90,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 4,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00890000.gif",
    "exlThumb": "/items/00890000.gif"
  },
  {
    "uid": 74,
    "id": 10,
    "name": "Arquebus",
    "credits": 20,
    "X": 2,
    "Y": 2,
    "type": 4,
    "ex_type": 0,
    "str": 30,
    "agi": 90,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 4,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/008A0000.gif",
    "exlThumb": "/items/008A0000.gif"
  },
  {
    "uid": 75,
    "id": 11,
    "name": "Light Crossbow",
    "credits": 32,
    "X": 2,
    "Y": 3,
    "type": 4,
    "ex_type": 0,
    "str": 30,
    "agi": 90,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 4,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/008B0000.gif",
    "exlThumb": "/items/008B0000.gif"
  },
  {
    "uid": 76,
    "id": 12,
    "name": "Serpent Crossbow",
    "credits": 48,
    "X": 2,
    "Y": 3,
    "type": 4,
    "ex_type": 0,
    "str": 30,
    "agi": 100,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 4,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/008C0000.gif",
    "exlThumb": "/items/008C0000.gif"
  },
  {
    "uid": 77,
    "id": 13,
    "name": "Bluewing Crossbow",
    "credits": 68,
    "X": 2,
    "Y": 3,
    "type": 4,
    "ex_type": 0,
    "str": 40,
    "agi": 110,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 4,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/008D0000.gif",
    "exlThumb": "/items/008D0000.gif"
  },
  {
    "uid": 78,
    "id": 14,
    "name": "Aquagold Crossbow",
    "credits": 72,
    "X": 2,
    "Y": 3,
    "type": 4,
    "ex_type": 0,
    "str": 50,
    "agi": 130,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 4,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/008E0000.gif",
    "exlThumb": "/items/008E0000.gif"
  },
  {
    "uid": 79,
    "id": 15,
    "name": "Arrow",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 4,
    "ex_type": 0,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 4,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/008F0000.gif",
    "exlThumb": "/items/008F0000.gif"
  },
  {
    "uid": 80,
    "id": 16,
    "name": "Saint Crossbow",
    "credits": 84,
    "X": 2,
    "Y": 4,
    "type": 4,
    "ex_type": 0,
    "str": 50,
    "agi": 160,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 4,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00900000.gif",
    "exlThumb": "/items/00900000.gif"
  },
  {
    "uid": 81,
    "id": 17,
    "name": "Celestial Bow",
    "credits": 92,
    "X": 2,
    "Y": 4,
    "type": 4,
    "ex_type": 0,
    "str": 54,
    "agi": 198,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 4,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00910000.gif",
    "exlThumb": "/items/00910000.gif"
  },
  {
    "uid": 82,
    "id": 18,
    "name": "Crossbow of Archangel",
    "credits": 100,
    "X": 2,
    "Y": 3,
    "type": 4,
    "ex_type": 0,
    "str": 40,
    "agi": 110,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 4,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00920000.gif",
    "exlThumb": "/items/00920000.gif"
  },
  {
    "uid": 83,
    "id": 19,
    "name": "Great Reign Crossbow",
    "credits": 100,
    "X": 2,
    "Y": 3,
    "type": 4,
    "ex_type": 0,
    "str": 61,
    "agi": 285,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 4,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00930000.gif",
    "exlThumb": "/items/00930000.gif"
  },
  {
    "uid": 84,
    "id": 20,
    "name": "Arrow Viper Bow",
    "credits": 135,
    "X": 2,
    "Y": 4,
    "type": 4,
    "ex_type": 0,
    "str": 52,
    "agi": 245,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 4,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00940000.gif",
    "exlThumb": "/items/00940000.gif"
  },
  {
    "uid": 85,
    "id": 21,
    "name": "Sylph Wind Bow",
    "credits": 147,
    "X": 2,
    "Y": 4,
    "type": 4,
    "ex_type": 0,
    "str": 46,
    "agi": 210,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 4,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00950000.gif",
    "exlThumb": "/items/00950000.gif"
  },
  {
    "uid": 86,
    "id": 22,
    "name": "Emerald Bow",
    "credits": 142,
    "X": 2,
    "Y": 4,
    "type": 4,
    "ex_type": 0,
    "str": 60,
    "agi": 265,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 4,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00960000.gif",
    "exlThumb": "/items/00960000.gif"
  },
  {
    "uid": 87,
    "id": 0,
    "name": "Skull Staff",
    "credits": 6,
    "X": 1,
    "Y": 3,
    "type": 5,
    "ex_type": 0,
    "str": 40,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 5,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00A00000.gif",
    "exlThumb": "/items/10A00000.gif"
  },
  {
    "uid": 88,
    "id": 1,
    "name": "Angelic Staff",
    "credits": 18,
    "X": 2,
    "Y": 3,
    "type": 5,
    "ex_type": 0,
    "str": 50,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 5,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00A10000.gif",
    "exlThumb": "/items/10A10000.gif"
  },
  {
    "uid": 89,
    "id": 2,
    "name": "Serpent Staff",
    "credits": 30,
    "X": 2,
    "Y": 3,
    "type": 5,
    "ex_type": 0,
    "str": 50,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 5,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00A20000.gif",
    "exlThumb": "/items/10A20000.gif"
  },
  {
    "uid": 90,
    "id": 3,
    "name": "Thunder Staff",
    "credits": 42,
    "X": 2,
    "Y": 4,
    "type": 5,
    "ex_type": 0,
    "str": 40,
    "agi": 10,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 5,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00A30000.gif",
    "exlThumb": "/items/10A30000.gif"
  },
  {
    "uid": 91,
    "id": 4,
    "name": "Gorgon Staff",
    "credits": 52,
    "X": 2,
    "Y": 4,
    "type": 5,
    "ex_type": 0,
    "str": 50,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 5,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00A40000.gif",
    "exlThumb": "/items/10A40000.gif"
  },
  {
    "uid": 92,
    "id": 5,
    "name": "Legendary Staff",
    "credits": 59,
    "X": 1,
    "Y": 4,
    "type": 5,
    "ex_type": 0,
    "str": 50,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 5,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00A50000.gif",
    "exlThumb": "/items/10A50000.gif"
  },
  {
    "uid": 93,
    "id": 6,
    "name": "Staff of Resurrection",
    "credits": 70,
    "X": 1,
    "Y": 4,
    "type": 5,
    "ex_type": 0,
    "str": 60,
    "agi": 10,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 5,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00A60000.gif",
    "exlThumb": "/items/10A60000.gif"
  },
  {
    "uid": 94,
    "id": 7,
    "name": "Chaos Lighting Staff",
    "credits": 75,
    "X": 2,
    "Y": 4,
    "type": 5,
    "ex_type": 0,
    "str": 60,
    "agi": 10,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 5,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00A70000.gif",
    "exlThumb": "/items/10A70000.gif"
  },
  {
    "uid": 95,
    "id": 8,
    "name": "Staff of Destruction",
    "credits": 90,
    "X": 2,
    "Y": 4,
    "type": 5,
    "ex_type": 0,
    "str": 60,
    "agi": 10,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 5,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00A80000.gif",
    "exlThumb": "/items/10A80000.gif"
  },
  {
    "uid": 96,
    "id": 9,
    "name": "Dragon Soul Staff",
    "credits": 100,
    "X": 1,
    "Y": 4,
    "type": 5,
    "ex_type": 0,
    "str": 52,
    "agi": 16,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 5,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00A90000.gif",
    "exlThumb": "/items/00A90000.gif"
  },
  {
    "uid": 97,
    "id": 10,
    "name": "Staff of Archangel",
    "credits": 104,
    "X": 1,
    "Y": 4,
    "type": 5,
    "ex_type": 0,
    "str": 36,
    "agi": 4,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 5,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00AA0000.gif",
    "exlThumb": "/items/00AA0000.gif"
  },
  {
    "uid": 98,
    "id": 11,
    "name": "Staff of Kundun",
    "credits": 140,
    "X": 1,
    "Y": 4,
    "type": 5,
    "ex_type": 0,
    "str": 45,
    "agi": 16,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 5,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00AB0000.gif",
    "exlThumb": "/items/00AB0000.gif"
  },
  {
    "uid": 99,
    "id": 12,
    "name": "Grand Viper Staff",
    "credits": 160,
    "X": 1,
    "Y": 4,
    "type": 5,
    "ex_type": 0,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 5,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00AC0000.gif",
    "exlThumb": "/items/10AC0000.gif"
  },
  {
    "uid": 100,
    "id": 13,
    "name": "Platina Wing Staff",
    "credits": 130,
    "X": 1,
    "Y": 4,
    "type": 5,
    "ex_type": 0,
    "str": 50,
    "agi": 16,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 5,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00AD0000.gif",
    "exlThumb": "/items/00AD0000.gif"
  },
  {
    "uid": 101,
    "id": 0,
    "name": "Small Shield",
    "credits": 3,
    "X": 2,
    "Y": 2,
    "type": 6,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 2,
    "category": 6,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C00000.gif",
    "exlThumb": "/items/10C00000.gif"
  },
  {
    "uid": 102,
    "id": 1,
    "name": "Horn Shield",
    "credits": 9,
    "X": 2,
    "Y": 2,
    "type": 6,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 2,
    "category": 6,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C10000.gif",
    "exlThumb": "/items/10C10000.gif"
  },
  {
    "uid": 103,
    "id": 2,
    "name": "Kite Shield",
    "credits": 12,
    "X": 2,
    "Y": 2,
    "type": 6,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 2,
    "category": 6,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C20000.gif",
    "exlThumb": "/items/10C20000.gif"
  },
  {
    "uid": 104,
    "id": 3,
    "name": "Elven Shield",
    "credits": 21,
    "X": 2,
    "Y": 2,
    "type": 6,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 2,
    "category": 6,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C30000.gif",
    "exlThumb": "/items/10C30000.gif"
  },
  {
    "uid": 105,
    "id": 4,
    "name": "Buckler",
    "credits": 6,
    "X": 2,
    "Y": 2,
    "type": 6,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 2,
    "category": 6,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C40000.gif",
    "exlThumb": "/items/10C40000.gif"
  },
  {
    "uid": 106,
    "id": 5,
    "name": "Dragon Slayer Shield",
    "credits": 35,
    "X": 2,
    "Y": 2,
    "type": 6,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 2,
    "category": 6,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C50000.gif",
    "exlThumb": "/items/10C50000.gif"
  },
  {
    "uid": 107,
    "id": 6,
    "name": "Skull Shield",
    "credits": 15,
    "X": 2,
    "Y": 2,
    "type": 6,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 2,
    "category": 6,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C60000.gif",
    "exlThumb": "/items/10C60000.gif"
  },
  {
    "uid": 108,
    "id": 7,
    "name": "Spiked Shield",
    "credits": 30,
    "X": 2,
    "Y": 2,
    "type": 6,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 2,
    "category": 6,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C70000.gif",
    "exlThumb": "/items/10C70000.gif"
  },
  {
    "uid": 109,
    "id": 8,
    "name": "Tower Shield",
    "credits": 40,
    "X": 2,
    "Y": 2,
    "type": 6,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 2,
    "category": 6,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C80000.gif",
    "exlThumb": "/items/10C80000.gif"
  },
  {
    "uid": 110,
    "id": 9,
    "name": "Plate Shield",
    "credits": 25,
    "X": 2,
    "Y": 2,
    "type": 6,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 2,
    "category": 6,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C90000.gif",
    "exlThumb": "/items/10C90000.gif"
  },
  {
    "uid": 111,
    "id": 10,
    "name": "Large Round Shield",
    "credits": 18,
    "X": 2,
    "Y": 2,
    "type": 6,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 2,
    "category": 6,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00CA0000.gif",
    "exlThumb": "/items/10CA0000.gif"
  },
  {
    "uid": 112,
    "id": 11,
    "name": "Serpent Shield",
    "credits": 45,
    "X": 2,
    "Y": 2,
    "type": 6,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 2,
    "category": 6,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00CB0000.gif",
    "exlThumb": "/items/10CB0000.gif"
  },
  {
    "uid": 113,
    "id": 14,
    "name": "Legendary Shield",
    "credits": 48,
    "X": 2,
    "Y": 3,
    "type": 6,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 2,
    "category": 6,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00CE0000.gif",
    "exlThumb": "/items/10CE0000.gif"
  },
  {
    "uid": 114,
    "id": 12,
    "name": "Bronze Shield",
    "credits": 54,
    "X": 2,
    "Y": 2,
    "type": 6,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 2,
    "category": 6,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00CC0000.gif",
    "exlThumb": "/items/10CC0000.gif"
  },
  {
    "uid": 115,
    "id": 13,
    "name": "Dragon Shield",
    "credits": 60,
    "X": 2,
    "Y": 2,
    "type": 6,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 2,
    "category": 6,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00CD0000.gif",
    "exlThumb": "/items/10CD0000.gif"
  },
  {
    "uid": 116,
    "id": 15,
    "name": "Grand Soul Shield",
    "credits": 74,
    "X": 2,
    "Y": 3,
    "type": 6,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 2,
    "category": 6,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00CF0000.gif",
    "exlThumb": "/items/10CF0000.gif"
  },
  {
    "uid": 117,
    "id": 16,
    "name": "Elemental Shield",
    "credits": 66,
    "X": 2,
    "Y": 2,
    "type": 6,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 2,
    "category": 6,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00D00000.gif",
    "exlThumb": "/items/10D00000.gif"
  },
  {
    "uid": 118,
    "id": 0,
    "name": "Bronze Helm",
    "credits": 16,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E00000.gif",
    "exlThumb": "/items/00E00000.gif"
  },
  {
    "uid": 119,
    "id": 1,
    "name": "Dragon Helm",
    "credits": 57,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E10000.gif",
    "exlThumb": "/items/00E10000.gif"
  },
  {
    "uid": 120,
    "id": 2,
    "name": "Pad Helm",
    "credits": 5,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E20000.gif",
    "exlThumb": "/items/00E20000.gif"
  },
  {
    "uid": 121,
    "id": 3,
    "name": "Legendary Helm",
    "credits": 50,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E30000.gif",
    "exlThumb": "/items/00E30000.gif"
  },
  {
    "uid": 122,
    "id": 4,
    "name": "Bone Helm",
    "credits": 18,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E40000.gif",
    "exlThumb": "/items/00E40000.gif"
  },
  {
    "uid": 123,
    "id": 5,
    "name": "Leather Helm",
    "credits": 6,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E50000.gif",
    "exlThumb": "/items/00E50000.gif"
  },
  {
    "uid": 124,
    "id": 6,
    "name": "Scale Helm",
    "credits": 26,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E60000.gif",
    "exlThumb": "/items/00E60000.gif"
  },
  {
    "uid": 125,
    "id": 7,
    "name": "Sphinx Mask",
    "credits": 32,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E70000.gif",
    "exlThumb": "/items/00E70000.gif"
  },
  {
    "uid": 126,
    "id": 8,
    "name": "Brass Helm",
    "credits": 36,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E80000.gif",
    "exlThumb": "/items/00E80000.gif"
  },
  {
    "uid": 127,
    "id": 9,
    "name": "Plate Helm",
    "credits": 46,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E90000.gif",
    "exlThumb": "/items/00E90000.gif"
  },
  {
    "uid": 128,
    "id": 10,
    "name": "Vine Helm",
    "credits": 6,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00EA0000.gif",
    "exlThumb": "/items/00EA0000.gif"
  },
  {
    "uid": 129,
    "id": 11,
    "name": "Silk Helm",
    "credits": 16,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00EB0000.gif",
    "exlThumb": "/items/00EB0000.gif"
  },
  {
    "uid": 130,
    "id": 12,
    "name": "Wind Helm",
    "credits": 28,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00EC0000.gif",
    "exlThumb": "/items/00EC0000.gif"
  },
  {
    "uid": 131,
    "id": 13,
    "name": "Spirit Helm",
    "credits": 40,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00ED0000.gif",
    "exlThumb": "/items/00ED0000.gif"
  },
  {
    "uid": 132,
    "id": 14,
    "name": "Guardian Helm",
    "credits": 53,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00EE0000.gif",
    "exlThumb": "/items/00EE0000.gif"
  },
  {
    "uid": 133,
    "id": 16,
    "name": "Black Dragon Helm",
    "credits": 82,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00F00000.gif",
    "exlThumb": "/items/00F00000.gif"
  },
  {
    "uid": 134,
    "id": 17,
    "name": "Dark Phoenix Helm",
    "credits": 92,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00F10000.gif",
    "exlThumb": "/items/00F10000.gif"
  },
  {
    "uid": 135,
    "id": 18,
    "name": "Grand Soul Helm",
    "credits": 81,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00F20000.gif",
    "exlThumb": "/items/00F20000.gif"
  },
  {
    "uid": 136,
    "id": 19,
    "name": "Divine Helm",
    "credits": 85,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00F30000.gif",
    "exlThumb": "/items/00F30000.gif"
  },
  {
    "uid": 137,
    "id": 21,
    "name": "Great Dragon Helm",
    "credits": 104,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00F50000.gif",
    "exlThumb": "/items/00F50000.gif"
  },
  {
    "uid": 138,
    "id": 22,
    "name": "Dark Soul Helm",
    "credits": 110,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00F60000.gif",
    "exlThumb": "/items/00F60000.gif"
  },
  {
    "uid": 139,
    "id": 24,
    "name": "Red Spirit Helm",
    "credits": 93,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00F80000.gif",
    "exlThumb": "/items/00F80000.gif"
  },
  {
    "uid": 140,
    "id": 25,
    "name": "Light Plate Mask",
    "credits": 46,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00F90000.gif",
    "exlThumb": "/items/00F90000.gif"
  },
  {
    "uid": 141,
    "id": 26,
    "name": "Adamantine Mask",
    "credits": 66,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00FA0000.gif",
    "exlThumb": "/items/00FA0000.gif"
  },
  {
    "uid": 142,
    "id": 27,
    "name": "Dark Steel Mask",
    "credits": 86,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00FB0000.gif",
    "exlThumb": "/items/00FB0000.gif"
  },
  {
    "uid": 143,
    "id": 28,
    "name": "Dark Master Mask",
    "credits": 106,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00FC0000.gif",
    "exlThumb": "/items/00FC0000.gif"
  },
  {
    "uid": 144,
    "id": 29,
    "name": "Dragon Knight Helm",
    "credits": 130,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00FD0000.gif",
    "exlThumb": "/items/00FD0000.gif"
  },
  {
    "uid": 145,
    "id": 30,
    "name": "Venom Mist Helm",
    "credits": 126,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00FE0000.gif",
    "exlThumb": "/items/00FE0000.gif"
  },
  {
    "uid": 146,
    "id": 31,
    "name": "Sylpid Ray Helm",
    "credits": 126,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00FF0000.gif",
    "exlThumb": "/items/00FF0000.gif"
  },
  {
    "uid": 147,
    "id": 33,
    "name": "Sunlight Helm",
    "credits": 130,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E100F9.gif",
    "exlThumb": "/items/00E100F9.gif"
  },
  {
    "uid": 148,
    "id": 34,
    "name": "Gorgon Plate Helm",
    "credits": 130,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E200F9.gif",
    "exlThumb": "/items/00E200F9.gif"
  },
  {
    "uid": 149,
    "id": 35,
    "name": "Onyx Helm",
    "credits": 130,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E300F9.gif",
    "exlThumb": "/items/00E300F9.gif"
  },
  {
    "uid": 150,
    "id": 36,
    "name": "Emerald Helm",
    "credits": 130,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E400F9.gif",
    "exlThumb": "/items/00E400F9.gif"
  },
  {
    "uid": 151,
    "id": 0,
    "name": "Bronze Armor",
    "credits": 18,
    "X": 2,
    "Y": 2,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00008000.gif",
    "exlThumb": "/items/00008000.gif"
  },
  {
    "uid": 152,
    "id": 1,
    "name": "Dragon Armor",
    "credits": 59,
    "X": 2,
    "Y": 3,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00018000.gif",
    "exlThumb": "/items/00018000.gif"
  },
  {
    "uid": 153,
    "id": 2,
    "name": "Pad Armor",
    "credits": 10,
    "X": 2,
    "Y": 2,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00028000.gif",
    "exlThumb": "/items/00028000.gif"
  },
  {
    "uid": 154,
    "id": 3,
    "name": "Legendary Armor",
    "credits": 56,
    "X": 2,
    "Y": 2,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00038000.gif",
    "exlThumb": "/items/00038000.gif"
  },
  {
    "uid": 155,
    "id": 4,
    "name": "Bone Armor",
    "credits": 22,
    "X": 2,
    "Y": 2,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00048000.gif",
    "exlThumb": "/items/00048000.gif"
  },
  {
    "uid": 156,
    "id": 5,
    "name": "Leathre Armor",
    "credits": 10,
    "X": 2,
    "Y": 3,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00058000.gif",
    "exlThumb": "/items/00058000.gif"
  },
  {
    "uid": 157,
    "id": 6,
    "name": "Scale Armor",
    "credits": 28,
    "X": 2,
    "Y": 2,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00068000.gif",
    "exlThumb": "/items/00068000.gif"
  },
  {
    "uid": 158,
    "id": 7,
    "name": "Sphinx Armor",
    "credits": 38,
    "X": 2,
    "Y": 3,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00078000.gif",
    "exlThumb": "/items/00078000.gif"
  },
  {
    "uid": 159,
    "id": 8,
    "name": "Brass Armor",
    "credits": 38,
    "X": 2,
    "Y": 2,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00088000.gif",
    "exlThumb": "/items/00088000.gif"
  },
  {
    "uid": 160,
    "id": 9,
    "name": "Plate Armor",
    "credits": 48,
    "X": 2,
    "Y": 2,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00098000.gif",
    "exlThumb": "/items/00098000.gif"
  },
  {
    "uid": 161,
    "id": 10,
    "name": "Vine Armor",
    "credits": 10,
    "X": 2,
    "Y": 2,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/000A8000.gif",
    "exlThumb": "/items/000A8000.gif"
  },
  {
    "uid": 162,
    "id": 11,
    "name": "Silk Armor",
    "credits": 20,
    "X": 2,
    "Y": 2,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/000B8000.gif",
    "exlThumb": "/items/000B8000.gif"
  },
  {
    "uid": 163,
    "id": 12,
    "name": "Wind Armor",
    "credits": 32,
    "X": 2,
    "Y": 2,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/000C8000.gif",
    "exlThumb": "/items/000C8000.gif"
  },
  {
    "uid": 164,
    "id": 13,
    "name": "Spirit Armor",
    "credits": 44,
    "X": 2,
    "Y": 2,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/000D8000.gif",
    "exlThumb": "/items/000D8000.gif"
  },
  {
    "uid": 165,
    "id": 14,
    "name": "Guardian Armor",
    "credits": 57,
    "X": 2,
    "Y": 2,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/000E8000.gif",
    "exlThumb": "/items/000E8000.gif"
  },
  {
    "uid": 166,
    "id": 15,
    "name": "Storm Crow Armor",
    "credits": 80,
    "X": 2,
    "Y": 3,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/000F8000.gif",
    "exlThumb": "/items/000F8000.gif"
  },
  {
    "uid": 167,
    "id": 16,
    "name": "Black Dragon Armor",
    "credits": 90,
    "X": 2,
    "Y": 3,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00108000.gif",
    "exlThumb": "/items/00108000.gif"
  },
  {
    "uid": 168,
    "id": 17,
    "name": "Dark Phoenix Armor",
    "credits": 100,
    "X": 2,
    "Y": 3,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00118000.gif",
    "exlThumb": "/items/00118000.gif"
  },
  {
    "uid": 169,
    "id": 18,
    "name": "Grand Soul Armor",
    "credits": 91,
    "X": 2,
    "Y": 3,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00128000.gif",
    "exlThumb": "/items/00128000.gif"
  },
  {
    "uid": 170,
    "id": 19,
    "name": "Divine Armor",
    "credits": 92,
    "X": 2,
    "Y": 2,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00138000.gif",
    "exlThumb": "/items/00138000.gif"
  },
  {
    "uid": 171,
    "id": 20,
    "name": "Thunder Hawk Armor",
    "credits": 107,
    "X": 2,
    "Y": 3,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00148000.gif",
    "exlThumb": "/items/00148000.gif"
  },
  {
    "uid": 172,
    "id": 21,
    "name": "Great Dragon Armor",
    "credits": 126,
    "X": 2,
    "Y": 3,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00158000.gif",
    "exlThumb": "/items/00158000.gif"
  },
  {
    "uid": 173,
    "id": 22,
    "name": "Dark Soul Armor",
    "credits": 122,
    "X": 2,
    "Y": 3,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00168000.gif",
    "exlThumb": "/items/00168000.gif"
  },
  {
    "uid": 174,
    "id": 23,
    "name": "Huricane Armor",
    "credits": 128,
    "X": 2,
    "Y": 3,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00178000.gif",
    "exlThumb": "/items/00178000.gif"
  },
  {
    "uid": 175,
    "id": 24,
    "name": "Red Sprit Armor",
    "credits": 109,
    "X": 2,
    "Y": 2,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00188000.gif",
    "exlThumb": "/items/00188000.gif"
  },
  {
    "uid": 176,
    "id": 25,
    "name": "Light Plate Armor",
    "credits": 62,
    "X": 2,
    "Y": 3,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00198000.gif",
    "exlThumb": "/items/00198000.gif"
  },
  {
    "uid": 177,
    "id": 26,
    "name": "Adamantine Armor",
    "credits": 78,
    "X": 2,
    "Y": 3,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/001A8000.gif",
    "exlThumb": "/items/001A8000.gif"
  },
  {
    "uid": 178,
    "id": 27,
    "name": "Dark Steel Armor",
    "credits": 96,
    "X": 2,
    "Y": 3,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/001B8000.gif",
    "exlThumb": "/items/001B8000.gif"
  },
  {
    "uid": 179,
    "id": 28,
    "name": "Dark Master Armor",
    "credits": 117,
    "X": 2,
    "Y": 3,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/001C8000.gif",
    "exlThumb": "/items/001C8000.gif"
  },
  {
    "uid": 180,
    "id": 29,
    "name": "Dragon Knight Armor",
    "credits": 140,
    "X": 2,
    "Y": 3,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/001D8000.gif",
    "exlThumb": "/items/001D8000.gif"
  },
  {
    "uid": 181,
    "id": 30,
    "name": "Venom Mist Armor",
    "credits": 146,
    "X": 2,
    "Y": 3,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/001E8000.gif",
    "exlThumb": "/items/001E8000.gif"
  },
  {
    "uid": 182,
    "id": 31,
    "name": "Sylpid Ray Armor",
    "credits": 146,
    "X": 2,
    "Y": 3,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/001F8000.gif",
    "exlThumb": "/items/001F8000.gif"
  },
  {
    "uid": 183,
    "id": 32,
    "name": "Volcano Armor",
    "credits": 147,
    "X": 2,
    "Y": 3,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/000080F9.gif",
    "exlThumb": "/items/000080F9.gif"
  },
  {
    "uid": 184,
    "id": 33,
    "name": "Sunlight Armor",
    "credits": 147,
    "X": 2,
    "Y": 3,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/000180F9.gif",
    "exlThumb": "/items/000180F9.gif"
  },
  {
    "uid": 185,
    "id": 34,
    "name": "Gorgon Plate Armor",
    "credits": 130,
    "X": 2,
    "Y": 3,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/000280F9.gif",
    "exlThumb": "/items/000280F9.gif"
  },
  {
    "uid": 186,
    "id": 35,
    "name": "Onyx Armor",
    "credits": 130,
    "X": 2,
    "Y": 3,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/000380F9.gif",
    "exlThumb": "/items/000380F9.gif"
  },
  {
    "uid": 187,
    "id": 36,
    "name": "Emerald Armor",
    "credits": 130,
    "X": 2,
    "Y": 3,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/000480F9.gif",
    "exlThumb": "/items/000480F9.gif"
  },
  {
    "uid": 188,
    "id": 0,
    "name": "Bronze Pants",
    "credits": 15,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00208000.gif",
    "exlThumb": "/items/00208000.gif"
  },
  {
    "uid": 189,
    "id": 1,
    "name": "Dragon Pants",
    "credits": 55,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00218000.gif",
    "exlThumb": "/items/00218000.gif"
  },
  {
    "uid": 190,
    "id": 2,
    "name": "Pad Pants",
    "credits": 8,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00228000.gif",
    "exlThumb": "/items/00228000.gif"
  },
  {
    "uid": 191,
    "id": 3,
    "name": "Legendary Pants",
    "credits": 53,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00238000.gif",
    "exlThumb": "/items/00238000.gif"
  },
  {
    "uid": 192,
    "id": 4,
    "name": "Bone Pants",
    "credits": 20,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00248000.gif",
    "exlThumb": "/items/00248000.gif"
  },
  {
    "uid": 193,
    "id": 5,
    "name": "Leather Pants",
    "credits": 8,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00258000.gif",
    "exlThumb": "/items/00258000.gif"
  },
  {
    "uid": 194,
    "id": 6,
    "name": "Scale Pants",
    "credits": 25,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00268000.gif",
    "exlThumb": "/items/00268000.gif"
  },
  {
    "uid": 195,
    "id": 7,
    "name": "Sphinx Pants",
    "credits": 34,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00278000.gif",
    "exlThumb": "/items/00278000.gif"
  },
  {
    "uid": 196,
    "id": 8,
    "name": "Brass Pants",
    "credits": 35,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00288000.gif",
    "exlThumb": "/items/00288000.gif"
  },
  {
    "uid": 197,
    "id": 9,
    "name": "Plate Pants",
    "credits": 45,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00298000.gif",
    "exlThumb": "/items/00298000.gif"
  },
  {
    "uid": 198,
    "id": 10,
    "name": "Vine Pants",
    "credits": 8,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/002A8000.gif",
    "exlThumb": "/items/002A8000.gif"
  },
  {
    "uid": 199,
    "id": 11,
    "name": "Silk Pants",
    "credits": 18,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/002B8000.gif",
    "exlThumb": "/items/002B8000.gif"
  },
  {
    "uid": 200,
    "id": 12,
    "name": "Wind Pants",
    "credits": 30,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/002C8000.gif",
    "exlThumb": "/items/002C8000.gif"
  },
  {
    "uid": 201,
    "id": 13,
    "name": "Spirit Pants",
    "credits": 42,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/002D8000.gif",
    "exlThumb": "/items/002D8000.gif"
  },
  {
    "uid": 202,
    "id": 14,
    "name": "Guardian Pants",
    "credits": 54,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/002E8000.gif",
    "exlThumb": "/items/002E8000.gif"
  },
  {
    "uid": 203,
    "id": 15,
    "name": "Storm Crow Pants",
    "credits": 74,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/002F8000.gif",
    "exlThumb": "/items/002F8000.gif"
  },
  {
    "uid": 204,
    "id": 16,
    "name": "Black Dragon Pants",
    "credits": 84,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00308000.gif",
    "exlThumb": "/items/00308000.gif"
  },
  {
    "uid": 205,
    "id": 17,
    "name": "Dark Phoenix Pants",
    "credits": 96,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00318000.gif",
    "exlThumb": "/items/00318000.gif"
  },
  {
    "uid": 206,
    "id": 18,
    "name": "Grand Soul Pants",
    "credits": 86,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00328000.gif",
    "exlThumb": "/items/00328000.gif"
  },
  {
    "uid": 207,
    "id": 19,
    "name": "Divine Pants",
    "credits": 88,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00338000.gif",
    "exlThumb": "/items/00338000.gif"
  },
  {
    "uid": 208,
    "id": 20,
    "name": "Thunder Hawk Pants",
    "credits": 99,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00348000.gif",
    "exlThumb": "/items/00348000.gif"
  },
  {
    "uid": 209,
    "id": 21,
    "name": "Great Dragon Pants",
    "credits": 113,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00358000.gif",
    "exlThumb": "/items/00358000.gif"
  },
  {
    "uid": 210,
    "id": 22,
    "name": "Dark Soul Pants",
    "credits": 117,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00368000.gif",
    "exlThumb": "/items/00368000.gif"
  },
  {
    "uid": 211,
    "id": 23,
    "name": "Huricane Pants",
    "credits": 122,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00378000.gif",
    "exlThumb": "/items/00378000.gif"
  },
  {
    "uid": 212,
    "id": 24,
    "name": "Red Spirit Pants",
    "credits": 100,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00388000.gif",
    "exlThumb": "/items/00388000.gif"
  },
  {
    "uid": 213,
    "id": 25,
    "name": "Light Plate Pants",
    "credits": 50,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00398000.gif",
    "exlThumb": "/items/00398000.gif"
  },
  {
    "uid": 214,
    "id": 26,
    "name": "Adamantine Pants",
    "credits": 70,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/003A8000.gif",
    "exlThumb": "/items/003A8000.gif"
  },
  {
    "uid": 215,
    "id": 27,
    "name": "Dark Steel Pants",
    "credits": 92,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/003B8000.gif",
    "exlThumb": "/items/003B8000.gif"
  },
  {
    "uid": 216,
    "id": 28,
    "name": "Dark Master Pants",
    "credits": 110,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/003C8000.gif",
    "exlThumb": "/items/003C8000.gif"
  },
  {
    "uid": 217,
    "id": 29,
    "name": "Dragon Knight Pants",
    "credits": 134,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/003D8000.gif",
    "exlThumb": "/items/003D8000.gif"
  },
  {
    "uid": 218,
    "id": 30,
    "name": "Venom Mist Pants",
    "credits": 135,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/003E8000.gif",
    "exlThumb": "/items/003E8000.gif"
  },
  {
    "uid": 219,
    "id": 31,
    "name": "Sylpid Ray Pants",
    "credits": 135,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/003F8000.gif",
    "exlThumb": "/items/003F8000.gif"
  },
  {
    "uid": 220,
    "id": 32,
    "name": "Volcano Pants",
    "credits": 135,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/002080F9.gif",
    "exlThumb": "/items/002080F9.gif"
  },
  {
    "uid": 221,
    "id": 33,
    "name": "Sunlight Pants",
    "credits": 140,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/002180F9.gif",
    "exlThumb": "/items/002180F9.gif"
  },
  {
    "uid": 222,
    "id": 34,
    "name": "Gorgon Plate Pants",
    "credits": 130,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/002280F9.gif",
    "exlThumb": "/items/002280F9.gif"
  },
  {
    "uid": 223,
    "id": 35,
    "name": "Onyx Pants",
    "credits": 130,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/002380F9.gif",
    "exlThumb": "/items/002380F9.gif"
  },
  {
    "uid": 224,
    "id": 36,
    "name": "Emerald Pants",
    "credits": 130,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/002480F9.gif",
    "exlThumb": "/items/002480F9.gif"
  },
  {
    "uid": 225,
    "id": 0,
    "name": "Bronze Gloves",
    "credits": 13,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00408000.gif",
    "exlThumb": "/items/00408000.gif"
  },
  {
    "uid": 226,
    "id": 1,
    "name": "Dragon Gloves",
    "credits": 52,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00418000.gif",
    "exlThumb": "/items/00418000.gif"
  },
  {
    "uid": 227,
    "id": 3,
    "name": "Legendary Gloves",
    "credits": 44,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00438000.gif",
    "exlThumb": "/items/00438000.gif"
  },
  {
    "uid": 228,
    "id": 2,
    "name": "Pad Gloves",
    "credits": 3,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00428000.gif",
    "exlThumb": "/items/00428000.gif"
  },
  {
    "uid": 229,
    "id": 4,
    "name": "Bone Gloves",
    "credits": 14,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00448000.gif",
    "exlThumb": "/items/00448000.gif"
  },
  {
    "uid": 230,
    "id": 5,
    "name": "Leather Gloves",
    "credits": 4,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00458000.gif",
    "exlThumb": "/items/00458000.gif"
  },
  {
    "uid": 231,
    "id": 6,
    "name": "Scale Gloves",
    "credits": 22,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00468000.gif",
    "exlThumb": "/items/00468000.gif"
  },
  {
    "uid": 232,
    "id": 7,
    "name": "Sphinx Gloves",
    "credits": 28,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00478000.gif",
    "exlThumb": "/items/00478000.gif"
  },
  {
    "uid": 233,
    "id": 8,
    "name": "Brass Gloves",
    "credits": 32,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00488000.gif",
    "exlThumb": "/items/00488000.gif"
  },
  {
    "uid": 234,
    "id": 9,
    "name": "Plate Gloves",
    "credits": 42,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00498000.gif",
    "exlThumb": "/items/00498000.gif"
  },
  {
    "uid": 235,
    "id": 15,
    "name": "Storm Crow Gloves",
    "credits": 70,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/004F8000.gif",
    "exlThumb": "/items/004F8000.gif"
  },
  {
    "uid": 236,
    "id": 16,
    "name": "Black Dragon Gloves",
    "credits": 76,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00508000.gif",
    "exlThumb": "/items/00508000.gif"
  },
  {
    "uid": 237,
    "id": 17,
    "name": "Dark Phoenix Gloves",
    "credits": 86,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00518000.gif",
    "exlThumb": "/items/00518000.gif"
  },
  {
    "uid": 238,
    "id": 18,
    "name": "Grand Soul Gloves",
    "credits": 70,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00528000.gif",
    "exlThumb": "/items/00528000.gif"
  },
  {
    "uid": 239,
    "id": 10,
    "name": "Vine Gloves",
    "credits": 4,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/004A8000.gif",
    "exlThumb": "/items/004A8000.gif"
  },
  {
    "uid": 240,
    "id": 11,
    "name": "Silk Gloves",
    "credits": 14,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/004B8000.gif",
    "exlThumb": "/items/004B8000.gif"
  },
  {
    "uid": 241,
    "id": 12,
    "name": "Wind Gloves",
    "credits": 26,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/004C8000.gif",
    "exlThumb": "/items/004C8000.gif"
  },
  {
    "uid": 242,
    "id": 13,
    "name": "Spirit Gloves",
    "credits": 38,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/004D8000.gif",
    "exlThumb": "/items/004D8000.gif"
  },
  {
    "uid": 243,
    "id": 14,
    "name": "Guardian Gloves",
    "credits": 50,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/004E8000.gif",
    "exlThumb": "/items/004E8000.gif"
  },
  {
    "uid": 244,
    "id": 19,
    "name": "Divine Gloves",
    "credits": 72,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00538000.gif",
    "exlThumb": "/items/00538000.gif"
  },
  {
    "uid": 245,
    "id": 20,
    "name": "Thunder Hawk Gloves",
    "credits": 89,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00548000.gif",
    "exlThumb": "/items/00548000.gif"
  },
  {
    "uid": 246,
    "id": 21,
    "name": "Great Dragon Gloves",
    "credits": 94,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00558000.gif",
    "exlThumb": "/items/00558000.gif"
  },
  {
    "uid": 247,
    "id": 22,
    "name": "Dark Soul Gloves",
    "credits": 87,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00568000.gif",
    "exlThumb": "/items/00568000.gif"
  },
  {
    "uid": 248,
    "id": 23,
    "name": "Hurricane Gloves",
    "credits": 102,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00578000.gif",
    "exlThumb": "/items/00578000.gif"
  },
  {
    "uid": 249,
    "id": 24,
    "name": "Red Spirit Gloves",
    "credits": 84,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00588000.gif",
    "exlThumb": "/items/00588000.gif"
  },
  {
    "uid": 250,
    "id": 25,
    "name": "Light Plate Gloves",
    "credits": 42,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00598000.gif",
    "exlThumb": "/items/00598000.gif"
  },
  {
    "uid": 251,
    "id": 26,
    "name": "Adamantine Gloves",
    "credits": 57,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/005A8000.gif",
    "exlThumb": "/items/005A8000.gif"
  },
  {
    "uid": 252,
    "id": 27,
    "name": "Dark Steel Gloves",
    "credits": 75,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/005B8000.gif",
    "exlThumb": "/items/005B8000.gif"
  },
  {
    "uid": 253,
    "id": 28,
    "name": "Dark Master Gloves",
    "credits": 89,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/005C8000.gif",
    "exlThumb": "/items/005C8000.gif"
  },
  {
    "uid": 254,
    "id": 29,
    "name": "Dragon Knight Gloves",
    "credits": 114,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/005D8000.gif",
    "exlThumb": "/items/005D8000.gif"
  },
  {
    "uid": 255,
    "id": 30,
    "name": "Venom Mist Gloves",
    "credits": 111,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/005E8000.gif",
    "exlThumb": "/items/005E8000.gif"
  },
  {
    "uid": 256,
    "id": 31,
    "name": "Sylpid Ray Gloves",
    "credits": 111,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/005F8000.gif",
    "exlThumb": "/items/005F8000.gif"
  },
  {
    "uid": 257,
    "id": 32,
    "name": "Volcano Gloves",
    "credits": 127,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/004080F9.gif",
    "exlThumb": "/items/004080F9.gif"
  },
  {
    "uid": 258,
    "id": 33,
    "name": "Sunlight Gloves",
    "credits": 110,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/004180F9.gif",
    "exlThumb": "/items/004180F9.gif"
  },
  {
    "uid": 259,
    "id": 34,
    "name": "Gorgon Plate Gloves",
    "credits": 130,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/004280F9.gif",
    "exlThumb": "/items/004280F9.gif"
  },
  {
    "uid": 260,
    "id": 35,
    "name": "Onyx Gloves",
    "credits": 130,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/004380F9.gif",
    "exlThumb": "/items/004380F9.gif"
  },
  {
    "uid": 261,
    "id": 36,
    "name": "Emerald Gloves",
    "credits": 130,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/004480F9.gif",
    "exlThumb": "/items/004480F9.gif"
  },
  {
    "uid": 262,
    "id": 0,
    "name": "Bronze Boots",
    "credits": 12,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00608000.gif",
    "exlThumb": "/items/00608000.gif"
  },
  {
    "uid": 263,
    "id": 1,
    "name": "Dragon Boots",
    "credits": 54,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00618000.gif",
    "exlThumb": "/items/00618000.gif"
  },
  {
    "uid": 264,
    "id": 2,
    "name": "Pad Boots",
    "credits": 4,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 3,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00628000.gif",
    "exlThumb": "/items/00628000.gif"
  },
  {
    "uid": 265,
    "id": 3,
    "name": "Legendary Boots",
    "credits": 46,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00638000.gif",
    "exlThumb": "/items/00638000.gif"
  },
  {
    "uid": 266,
    "id": 4,
    "name": "Bone Boots",
    "credits": 16,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00648000.gif",
    "exlThumb": "/items/00648000.gif"
  },
  {
    "uid": 267,
    "id": 5,
    "name": "Leather Boots",
    "credits": 5,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 3,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00658000.gif",
    "exlThumb": "/items/00658000.gif"
  },
  {
    "uid": 268,
    "id": 6,
    "name": "Scale Boots",
    "credits": 22,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00668000.gif",
    "exlThumb": "/items/00668000.gif"
  },
  {
    "uid": 269,
    "id": 7,
    "name": "Sphinx Boots",
    "credits": 30,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00678000.gif",
    "exlThumb": "/items/00678000.gif"
  },
  {
    "uid": 270,
    "id": 8,
    "name": "Brass Boots",
    "credits": 32,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00688000.gif",
    "exlThumb": "/items/00688000.gif"
  },
  {
    "uid": 271,
    "id": 9,
    "name": "Plate Boots",
    "credits": 42,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00698000.gif",
    "exlThumb": "/items/00698000.gif"
  },
  {
    "uid": 272,
    "id": 10,
    "name": "Vine Boots",
    "credits": 5,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/006A8000.gif",
    "exlThumb": "/items/006A8000.gif"
  },
  {
    "uid": 273,
    "id": 11,
    "name": "Silk Boots",
    "credits": 15,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/006B8000.gif",
    "exlThumb": "/items/006B8000.gif"
  },
  {
    "uid": 274,
    "id": 12,
    "name": "Wind Boots",
    "credits": 27,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/006C8000.gif",
    "exlThumb": "/items/006C8000.gif"
  },
  {
    "uid": 275,
    "id": 13,
    "name": "Spirit Boots",
    "credits": 40,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/006D8000.gif",
    "exlThumb": "/items/006D8000.gif"
  },
  {
    "uid": 276,
    "id": 14,
    "name": "Guardian Boots",
    "credits": 52,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/006E8000.gif",
    "exlThumb": "/items/006E8000.gif"
  },
  {
    "uid": 277,
    "id": 15,
    "name": "Storm Crow Boots",
    "credits": 72,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/006F8000.gif",
    "exlThumb": "/items/006F8000.gif"
  },
  {
    "uid": 278,
    "id": 16,
    "name": "Black Dragon Boots",
    "credits": 78,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00708000.gif",
    "exlThumb": "/items/00708000.gif"
  },
  {
    "uid": 279,
    "id": 17,
    "name": "Dark Phoenix Boots",
    "credits": 93,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00718000.gif",
    "exlThumb": "/items/00718000.gif"
  },
  {
    "uid": 280,
    "id": 18,
    "name": "Grand Soul Boots",
    "credits": 76,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00728000.gif",
    "exlThumb": "/items/00728000.gif"
  },
  {
    "uid": 281,
    "id": 19,
    "name": "Divine Boots",
    "credits": 81,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00738000.gif",
    "exlThumb": "/items/00738000.gif"
  },
  {
    "uid": 282,
    "id": 20,
    "name": "Thunder Hawk Boots",
    "credits": 92,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00748000.gif",
    "exlThumb": "/items/00748000.gif"
  },
  {
    "uid": 283,
    "id": 21,
    "name": "Great Dragon Boots",
    "credits": 98,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00758000.gif",
    "exlThumb": "/items/00758000.gif"
  },
  {
    "uid": 284,
    "id": 22,
    "name": "Dark Soul Boots",
    "credits": 95,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00768000.gif",
    "exlThumb": "/items/00768000.gif"
  },
  {
    "uid": 285,
    "id": 23,
    "name": "Huricane Boots",
    "credits": 110,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00778000.gif",
    "exlThumb": "/items/00778000.gif"
  },
  {
    "uid": 286,
    "id": 24,
    "name": "Red Spirit Boots",
    "credits": 87,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00788000.gif",
    "exlThumb": "/items/00788000.gif"
  },
  {
    "uid": 287,
    "id": 25,
    "name": "Light Plate Boots",
    "credits": 45,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00798000.gif",
    "exlThumb": "/items/00798000.gif"
  },
  {
    "uid": 288,
    "id": 26,
    "name": "Adamantine Boots",
    "credits": 60,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/007A8000.gif",
    "exlThumb": "/items/007A8000.gif"
  },
  {
    "uid": 289,
    "id": 27,
    "name": "Dark Steel Boots",
    "credits": 83,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/007B8000.gif",
    "exlThumb": "/items/007B8000.gif"
  },
  {
    "uid": 290,
    "id": 28,
    "name": "Dark Master Boots",
    "credits": 95,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/007C8000.gif",
    "exlThumb": "/items/007C8000.gif"
  },
  {
    "uid": 291,
    "id": 29,
    "name": "Dragon Knight Boots",
    "credits": 119,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/007D8000.gif",
    "exlThumb": "/items/007D8000.gif"
  },
  {
    "uid": 292,
    "id": 30,
    "name": "Venom Mist Boots",
    "credits": 119,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/007E8000.gif",
    "exlThumb": "/items/007E8000.gif"
  },
  {
    "uid": 293,
    "id": 31,
    "name": "Sylpid Ray Boots",
    "credits": 119,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/007F8000.gif",
    "exlThumb": "/items/007F8000.gif"
  },
  {
    "uid": 294,
    "id": 32,
    "name": "Volcano Boots",
    "credits": 131,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/006080F9.gif",
    "exlThumb": "/items/006080F9.gif"
  },
  {
    "uid": 295,
    "id": 33,
    "name": "Sunlight Boots",
    "credits": 121,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/006180F9.gif",
    "exlThumb": "/items/006180F9.gif"
  },
  {
    "uid": 296,
    "id": 34,
    "name": "Gorgon Plate Boots",
    "credits": 130,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/006280F9.gif",
    "exlThumb": "/items/006280F9.gif"
  },
  {
    "uid": 297,
    "id": 35,
    "name": "Onyx Boots",
    "credits": 130,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/006380F9.gif",
    "exlThumb": "/items/006380F9.gif"
  },
  {
    "uid": 298,
    "id": 36,
    "name": "Emerald Boots",
    "credits": 130,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/006480F9.gif",
    "exlThumb": "/items/006480F9.gif"
  },
  {
    "uid": 299,
    "id": 0,
    "name": "Guardian Angel",
    "credits": 23,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00A08000.gif",
    "exlThumb": "/items/00A08000.gif"
  },
  {
    "uid": 300,
    "id": 1,
    "name": "Imp",
    "credits": 5,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 255,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00A18000.gif",
    "exlThumb": "/items/00A18000.gif"
  },
  {
    "uid": 301,
    "id": 2,
    "name": "Horn of Uniria",
    "credits": 25,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00A28000.gif",
    "exlThumb": "/items/00A28000.gif"
  },
  {
    "uid": 302,
    "id": 3,
    "name": "Horn of Dinorant",
    "credits": 80,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 255,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00A38000.gif",
    "exlThumb": "/items/00A38000.gif"
  },
  {
    "uid": 303,
    "id": 4,
    "name": "Dark Horse",
    "credits": 218,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 255,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00A48000.gif",
    "exlThumb": "/items/00A48000.gif"
  },
  {
    "uid": 304,
    "id": 5,
    "name": "Dark Raven",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00A58000.gif",
    "exlThumb": "/items/00A58000.gif"
  },
  {
    "uid": 305,
    "id": 7,
    "name": "Contract(Summon",
    "credits": 0,
    "X": 0,
    "Y": 0,
    "type": 0,
    "ex_type": 0,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 0,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 0,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 0,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00070000.gif",
    "exlThumb": "/items/10070000.gif"
  },
  {
    "uid": 306,
    "id": 8,
    "name": "Ring of Ice",
    "credits": 20,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": 1,
    "str": 0,
    "agi": 2,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 1,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00A88000.gif",
    "exlThumb": "/items/00A88000.gif"
  },
  {
    "uid": 307,
    "id": 9,
    "name": "Ring of Poison",
    "credits": 17,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": 1,
    "str": 0,
    "agi": 4,
    "luck": 0,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 1,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00A98000.gif",
    "exlThumb": "/items/00A98000.gif"
  },
  {
    "uid": 308,
    "id": 10,
    "name": "Skeleton Disguise Ring",
    "credits": 1,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 255,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 12,
    "stickLevel": 2,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00AA800002.gif",
    "exlThumb": "/items/00AA800002.gif"
  },
  {
    "uid": 309,
    "id": 11,
    "name": "Guardian/Life Stone",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00AB800000.gif",
    "exlThumb": "/items/00AB800000.gif"
  },
  {
    "uid": 310,
    "id": 12,
    "name": "Pendant of Lighting",
    "credits": 21,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": 0,
    "str": 0,
    "agi": 3,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 1,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00AC8000.gif",
    "exlThumb": "/items/00AC8000.gif"
  },
  {
    "uid": 311,
    "id": 13,
    "name": "Pendant of Fire",
    "credits": 13,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": 0,
    "str": 0,
    "agi": 1,
    "luck": 0,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 1,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00AD8000.gif",
    "exlThumb": "/items/00AD8000.gif"
  },
  {
    "uid": 312,
    "id": 15,
    "name": "Fruits",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00AF800000.gif",
    "exlThumb": "/items/00AF800000.gif"
  },
  {
    "uid": 313,
    "id": 16,
    "name": "Scroll of Archangel",
    "credits": 0,
    "X": 1,
    "Y": 2,
    "type": 12,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/SinFoto.gif",
    "exlThumb": "/items/SinFoto.gif"
  },
  {
    "uid": 314,
    "id": 17,
    "name": "Blood Bone",
    "credits": 0,
    "X": 1,
    "Y": 2,
    "type": 12,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/SinFoto.gif",
    "exlThumb": "/items/SinFoto.gif"
  },
  {
    "uid": 315,
    "id": 18,
    "name": "Invisibility Cloak",
    "credits": 0,
    "X": 2,
    "Y": 2,
    "type": 12,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/SinFoto.gif",
    "exlThumb": "/items/SinFoto.gif"
  },
  {
    "uid": 316,
    "id": 19,
    "name": "Absolute Weapon of Archangel",
    "credits": 0,
    "X": 1,
    "Y": 2,
    "type": 12,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00B3800000.gif",
    "exlThumb": "/items/00B3800000.gif"
  },
  {
    "uid": 317,
    "id": 20,
    "name": "Wizards Ring",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 1,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00B4800000.gif",
    "exlThumb": "/items/00B4800000.gif"
  },
  {
    "uid": 318,
    "id": 21,
    "name": "Ring of Fire",
    "credits": 30,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": 1,
    "str": 0,
    "agi": 3,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 1,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00B58000.gif",
    "exlThumb": "/items/00B58000.gif"
  },
  {
    "uid": 319,
    "id": 22,
    "name": "Ring of Earth",
    "credits": 38,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": 1,
    "str": 0,
    "agi": 1,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 1,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00B68000.gif",
    "exlThumb": "/items/00B68000.gif"
  },
  {
    "uid": 320,
    "id": 23,
    "name": "Ring of Wind",
    "credits": 44,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": 1,
    "str": 0,
    "agi": 2,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 1,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00B78000.gif",
    "exlThumb": "/items/00B78000.gif"
  },
  {
    "uid": 321,
    "id": 24,
    "name": "Ring of Magic",
    "credits": 47,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 1,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00B88000.gif",
    "exlThumb": "/items/00B88000.gif"
  },
  {
    "uid": 322,
    "id": 25,
    "name": "Pendant of Ice",
    "credits": 34,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": 0,
    "str": 0,
    "agi": 1,
    "luck": 0,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 1,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00B98000.gif",
    "exlThumb": "/items/00B98000.gif"
  },
  {
    "uid": 323,
    "id": 26,
    "name": "Pendant of Wind",
    "credits": 42,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": 0,
    "str": 0,
    "agi": 2,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 1,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00BA8000.gif",
    "exlThumb": "/items/00BA8000.gif"
  },
  {
    "uid": 324,
    "id": 27,
    "name": "Pendant of Water",
    "credits": 46,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": 0,
    "str": 1,
    "agi": 4,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 1,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00BB8000.gif",
    "exlThumb": "/items/00BB8000.gif"
  },
  {
    "uid": 325,
    "id": 28,
    "name": "Pendant of Ability",
    "credits": 50,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": 0,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 1,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00BC8000.gif",
    "exlThumb": "/items/00BC8000.gif"
  },
  {
    "uid": 326,
    "id": 29,
    "name": "Armor of Guardman",
    "credits": 0,
    "X": 2,
    "Y": 2,
    "type": 12,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00BD8000.gif",
    "exlThumb": "/items/00BD8000.gif"
  },
  {
    "uid": 327,
    "id": 30,
    "name": "Cape of Lord",
    "credits": 180,
    "X": 2,
    "Y": 3,
    "type": 12,
    "ex_type": 2,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 14,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00BE8000.gif",
    "exlThumb": "/items/10BE8000.gif"
  },
  {
    "uid": 328,
    "id": 31,
    "name": "Spirit",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00BF800000.gif",
    "exlThumb": "/items/00BF800000.gif"
  },
  {
    "uid": 329,
    "id": 32,
    "name": "Splinter of Armor",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00A080F9.gif",
    "exlThumb": "/items/00A080F9.gif"
  },
  {
    "uid": 330,
    "id": 33,
    "name": "Bless of Guardian",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00A180F9.gif",
    "exlThumb": "/items/00A180F9.gif"
  },
  {
    "uid": 331,
    "id": 34,
    "name": "Claw of Beast",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00A280F9.gif",
    "exlThumb": "/items/00A280F9.gif"
  },
  {
    "uid": 332,
    "id": 35,
    "name": "Piece of Horn",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00A380F9.gif",
    "exlThumb": "/items/00A380F9.gif"
  },
  {
    "uid": 333,
    "id": 36,
    "name": "Broken Horn",
    "credits": 0,
    "X": 2,
    "Y": 2,
    "type": 12,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00A480F9.gif",
    "exlThumb": "/items/00A480F9.gif"
  },
  {
    "uid": 334,
    "id": 37,
    "name": "Horn of Fenrir",
    "credits": 450,
    "X": 2,
    "Y": 2,
    "type": 12,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 255,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00A580F9.gif",
    "exlThumb": "/items/10A580F9.gif"
  },
  {
    "uid": 335,
    "id": 38,
    "name": "Ring Of Moonlight",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 12,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 1,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00A680F9.gif",
    "exlThumb": "/items/00A680F9.gif"
  },
  {
    "uid": 336,
    "id": 0,
    "name": "Apple",
    "credits": 5,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": 0,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 255,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C08000.gif",
    "exlThumb": "/items/00C08000.gif"
  },
  {
    "uid": 337,
    "id": 1,
    "name": "Small Healing Potion",
    "credits": 10,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 255,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C18000.gif",
    "exlThumb": "/items/00C18000.gif"
  },
  {
    "uid": 338,
    "id": 2,
    "name": "Healing Potion",
    "credits": 20,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 255,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C28000.gif",
    "exlThumb": "/items/00C28000.gif"
  },
  {
    "uid": 339,
    "id": 3,
    "name": "Large Healing Potion",
    "credits": 30,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 255,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C38000.gif",
    "exlThumb": "/items/00C38000.gif"
  },
  {
    "uid": 340,
    "id": 4,
    "name": "Small Mana Potion",
    "credits": 10,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 255,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C48000.gif",
    "exlThumb": "/items/00C48000.gif"
  },
  {
    "uid": 341,
    "id": 5,
    "name": "Mana Potion",
    "credits": 20,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 255,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C58000.gif",
    "exlThumb": "/items/00C58000.gif"
  },
  {
    "uid": 342,
    "id": 6,
    "name": "Large Mana Potion",
    "credits": 30,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 255,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C68000.gif",
    "exlThumb": "/items/00C68000.gif"
  },
  {
    "uid": 343,
    "id": 7,
    "name": "Siege Potion",
    "credits": 30,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 255,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C7800000.gif",
    "exlThumb": "/items/00C7800000.gif"
  },
  {
    "uid": 344,
    "id": 8,
    "name": "Antidote",
    "credits": 10,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 255,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C88000.gif",
    "exlThumb": "/items/00C88000.gif"
  },
  {
    "uid": 345,
    "id": 9,
    "name": "Ale",
    "credits": 30,
    "X": 1,
    "Y": 2,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C9800000.gif",
    "exlThumb": "/items/00C9800000.gif"
  },
  {
    "uid": 346,
    "id": 10,
    "name": "Town Portal Scrol",
    "credits": 30,
    "X": 1,
    "Y": 2,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00CA8000.gif",
    "exlThumb": "/items/00CA8000.gif"
  },
  {
    "uid": 347,
    "id": 11,
    "name": "Box of Luck",
    "credits": 25,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 0,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00CB800000.gif",
    "exlThumb": "/items/00CB800000.gif"
  },
  {
    "uid": 348,
    "id": 12,
    "name": "Zen",
    "credits": 9,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00CC800000.gif",
    "exlThumb": "/items/00CC800000.gif"
  },
  {
    "uid": 349,
    "id": 13,
    "name": "Jewel of Bless",
    "credits": 15,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00CD8000.gif",
    "exlThumb": "/items/00CD8000.gif"
  },
  {
    "uid": 350,
    "id": 14,
    "name": "Lochs feather",
    "credits": 17,
    "X": 1,
    "Y": 2,
    "type": 12,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 14,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00AE800000.gif",
    "exlThumb": "/items/00AE800000.gif"
  },
  {
    "uid": 351,
    "id": 15,
    "name": "Zen",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00CF8000.gif",
    "exlThumb": "/items/00CF8000.gif"
  },
  {
    "uid": 352,
    "id": 16,
    "name": "Jewel of Life",
    "credits": 20,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00D08000.gif",
    "exlThumb": "/items/00D08000.gif"
  },
  {
    "uid": 353,
    "id": 20,
    "name": "Remedy of Love",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00D48000.gif",
    "exlThumb": "/items/00D48000.gif"
  },
  {
    "uid": 354,
    "id": 21,
    "name": "Rena",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00D5800000.gif",
    "exlThumb": "/items/00D5800000.gif"
  },
  {
    "uid": 355,
    "id": 22,
    "name": "Jewel of Creation",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00D68000.gif",
    "exlThumb": "/items/00D68000.gif"
  },
  {
    "uid": 356,
    "id": 23,
    "name": "Scroll of the Emperor",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00D7800000.gif",
    "exlThumb": "/items/00D7800000.gif"
  },
  {
    "uid": 357,
    "id": 24,
    "name": "Broken Sword",
    "credits": 1,
    "X": 1,
    "Y": 2,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00D8800000.gif",
    "exlThumb": "/items/00D8800000.gif"
  },
  {
    "uid": 358,
    "id": 25,
    "name": "Tear of Elf",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00D98000.gif",
    "exlThumb": "/items/00D98000.gif"
  },
  {
    "uid": 359,
    "id": 26,
    "name": "Soul Shard of Wizard",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00DA8000.gif",
    "exlThumb": "/items/00DA8000.gif"
  },
  {
    "uid": 360,
    "id": 28,
    "name": "Lost Map",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/SinFoto.gif",
    "exlThumb": "/items/SinFoto.gif"
  },
  {
    "uid": 361,
    "id": 29,
    "name": "Symbol of Kundun",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/SinFoto.gif",
    "exlThumb": "/items/SinFoto.gif"
  },
  {
    "uid": 362,
    "id": 31,
    "name": "Jewel of Guardian",
    "credits": 75,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00DF8000.gif",
    "exlThumb": "/items/00DF8000.gif"
  },
  {
    "uid": 363,
    "id": 32,
    "name": "Pink chocolate box",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C080F900.gif",
    "exlThumb": "/items/00C080F900.gif"
  },
  {
    "uid": 364,
    "id": 33,
    "name": "Deep-red chocolate box",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C180F900.gif",
    "exlThumb": "/items/00C180F900.gif"
  },
  {
    "uid": 365,
    "id": 34,
    "name": "Box with Green Onion",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C280F900.gif",
    "exlThumb": "/items/00C280F900.gif"
  },
  {
    "uid": 366,
    "id": 35,
    "name": "Small SD Potion",
    "credits": 50,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 255,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C380F9.gif",
    "exlThumb": "/items/00C380F9.gif"
  },
  {
    "uid": 367,
    "id": 36,
    "name": "Medium SD Potion",
    "credits": 80,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 255,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C480F9.gif",
    "exlThumb": "/items/00C480F9.gif"
  },
  {
    "uid": 368,
    "id": 37,
    "name": "Big SD Potion",
    "credits": 100,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 255,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C580F9.gif",
    "exlThumb": "/items/00C580F9.gif"
  },
  {
    "uid": 369,
    "id": 38,
    "name": "Small AG Potion",
    "credits": 20,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 255,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C680F9.gif",
    "exlThumb": "/items/00C680F9.gif"
  },
  {
    "uid": 370,
    "id": 39,
    "name": "Medium AG Potion",
    "credits": 40,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 255,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C780F9.gif",
    "exlThumb": "/items/00C780F9.gif"
  },
  {
    "uid": 371,
    "id": 40,
    "name": "Big AG Potion",
    "credits": 60,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 255,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C880F9.gif",
    "exlThumb": "/items/00C880F9.gif"
  },
  {
    "uid": 372,
    "id": 41,
    "name": "Application three",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00C980F9.gif",
    "exlThumb": "/items/00C980F9.gif"
  },
  {
    "uid": 373,
    "id": 42,
    "name": "Junior smelting",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00CA80F9.gif",
    "exlThumb": "/items/00CA80F9.gif"
  },
  {
    "uid": 374,
    "id": 43,
    "name": "Upper grade smelting",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00CB80F9.gif",
    "exlThumb": "/items/00CB80F9.gif"
  },
  {
    "uid": 375,
    "id": 0,
    "name": "Wings of Elf",
    "credits": 45,
    "X": 3,
    "Y": 2,
    "type": 14,
    "ex_type": 2,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 14,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00808000.gif",
    "exlThumb": "/items/10808000.gif"
  },
  {
    "uid": 376,
    "id": 1,
    "name": "Wings of Heaven",
    "credits": 45,
    "X": 5,
    "Y": 3,
    "type": 14,
    "ex_type": 2,
    "str": 0,
    "agi": 1,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 14,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00818000.gif",
    "exlThumb": "/items/10818000.gif"
  },
  {
    "uid": 377,
    "id": 2,
    "name": "Wings of Satan",
    "credits": 45,
    "X": 5,
    "Y": 2,
    "type": 14,
    "ex_type": 2,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 14,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00828000.gif",
    "exlThumb": "/items/10828000.gif"
  },
  {
    "uid": 378,
    "id": 3,
    "name": "Wings of Spirits",
    "credits": 150,
    "X": 5,
    "Y": 3,
    "type": 14,
    "ex_type": 2,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 14,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00838000.gif",
    "exlThumb": "/items/10838000.gif"
  },
  {
    "uid": 379,
    "id": 4,
    "name": "Wings of Soul",
    "credits": 150,
    "X": 5,
    "Y": 3,
    "type": 14,
    "ex_type": 2,
    "str": 0,
    "agi": 2,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 14,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00848000.gif",
    "exlThumb": "/items/10848000.gif"
  },
  {
    "uid": 380,
    "id": 5,
    "name": "Wings of Dragon",
    "credits": 150,
    "X": 3,
    "Y": 3,
    "type": 14,
    "ex_type": 2,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 14,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00858000.gif",
    "exlThumb": "/items/10858000.gif"
  },
  {
    "uid": 381,
    "id": 6,
    "name": "Wings of Darkness",
    "credits": 150,
    "X": 4,
    "Y": 2,
    "type": 14,
    "ex_type": 2,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 14,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00868000.gif",
    "exlThumb": "/items/10868000.gif"
  },
  {
    "uid": 382,
    "id": 7,
    "name": "Orb of Twisting Slash",
    "credits": 47,
    "X": 1,
    "Y": 1,
    "type": 14,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00878000.gif",
    "exlThumb": "/items/00878000.gif"
  },
  {
    "uid": 383,
    "id": 8,
    "name": "Healing Orb",
    "credits": 8,
    "X": 1,
    "Y": 1,
    "type": 14,
    "ex_type": -1,
    "str": 800,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00888000.gif",
    "exlThumb": "/items/00888000.gif"
  },
  {
    "uid": 384,
    "id": 9,
    "name": "Orb of Greater Fortitude",
    "credits": 60,
    "X": 1,
    "Y": 1,
    "type": 14,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00898000.gif",
    "exlThumb": "/items/00898000.gif"
  },
  {
    "uid": 385,
    "id": 10,
    "name": "Orb of Greater Damage",
    "credits": 18,
    "X": 1,
    "Y": 1,
    "type": 14,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/008A8000.gif",
    "exlThumb": "/items/008A8000.gif"
  },
  {
    "uid": 386,
    "id": 11,
    "name": "Orb of Summoning",
    "credits": 3,
    "X": 1,
    "Y": 1,
    "type": 14,
    "ex_type": -1,
    "str": 150,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/008B800000.gif",
    "exlThumb": "/items/008B800000.gif"
  },
  {
    "uid": 387,
    "id": 12,
    "name": "Orb of Rageful Blow",
    "credits": 78,
    "X": 1,
    "Y": 1,
    "type": 14,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/008C8000.gif",
    "exlThumb": "/items/008C8000.gif"
  },
  {
    "uid": 388,
    "id": 13,
    "name": "Orb of Impale",
    "credits": 20,
    "X": 1,
    "Y": 1,
    "type": 14,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/008D8000.gif",
    "exlThumb": "/items/008D8000.gif"
  },
  {
    "uid": 389,
    "id": 14,
    "name": "Orb of Greater Fortitude",
    "credits": 60,
    "X": 1,
    "Y": 1,
    "type": 14,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/008E8000.gif",
    "exlThumb": "/items/008E8000.gif"
  },
  {
    "uid": 390,
    "id": 15,
    "name": "Jewel of Chaos",
    "credits": 12,
    "X": 1,
    "Y": 1,
    "type": 14,
    "ex_type": -1,
    "str": 0,
    "agi": 1,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/008F8000.gif",
    "exlThumb": "/items/008F8000.gif"
  },
  {
    "uid": 391,
    "id": 16,
    "name": "Orb of Fire Slash",
    "credits": 60,
    "X": 1,
    "Y": 1,
    "type": 14,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00908000.gif",
    "exlThumb": "/items/00908000.gif"
  },
  {
    "uid": 392,
    "id": 17,
    "name": "Orb of Penetration",
    "credits": 64,
    "X": 1,
    "Y": 1,
    "type": 14,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00918000.gif",
    "exlThumb": "/items/00918000.gif"
  },
  {
    "uid": 393,
    "id": 18,
    "name": "Orb of Ice Arrow",
    "credits": 81,
    "X": 1,
    "Y": 1,
    "type": 14,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00928000.gif",
    "exlThumb": "/items/00928000.gif"
  },
  {
    "uid": 394,
    "id": 19,
    "name": "Orb of Death Stab",
    "credits": 72,
    "X": 1,
    "Y": 1,
    "type": 14,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00938000.gif",
    "exlThumb": "/items/00938000.gif"
  },
  {
    "uid": 395,
    "id": 21,
    "name": "Scroll of FireBurst",
    "credits": 74,
    "X": 1,
    "Y": 2,
    "type": 14,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00958000.gif",
    "exlThumb": "/items/00958000.gif"
  },
  {
    "uid": 396,
    "id": 22,
    "name": "Scroll of Summon",
    "credits": 98,
    "X": 1,
    "Y": 2,
    "type": 14,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00968000.gif",
    "exlThumb": "/items/00968000.gif"
  },
  {
    "uid": 397,
    "id": 23,
    "name": "Scroll of Critical Damage",
    "credits": 82,
    "X": 1,
    "Y": 2,
    "type": 14,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00978000.gif",
    "exlThumb": "/items/00978000.gif"
  },
  {
    "uid": 398,
    "id": 24,
    "name": "Scroll of Electric Spark",
    "credits": 92,
    "X": 1,
    "Y": 2,
    "type": 14,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00988000.gif",
    "exlThumb": "/items/00988000.gif"
  },
  {
    "uid": 399,
    "id": 26,
    "name": "Gem of Secret",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 14,
    "ex_type": -1,
    "str": 0,
    "agi": 1,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 12,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/009A800000.gif",
    "exlThumb": "/items/009A800000.gif"
  },
  {
    "uid": 400,
    "id": 35,
    "name": "Fire Scream Scroll",
    "credits": 102,
    "X": 1,
    "Y": 2,
    "type": 14,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/008380F9.gif",
    "exlThumb": "/items/008380F9.gif"
  },
  {
    "uid": 401,
    "id": 0,
    "name": "Scroll of Poison",
    "credits": 10,
    "X": 1,
    "Y": 2,
    "type": 15,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E08000.gif",
    "exlThumb": "/items/00E08000.gif"
  },
  {
    "uid": 402,
    "id": 1,
    "name": "Scroll of Meteorite",
    "credits": 11,
    "X": 1,
    "Y": 2,
    "type": 15,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E18000.gif",
    "exlThumb": "/items/00E18000.gif"
  },
  {
    "uid": 403,
    "id": 2,
    "name": "Scroll of Lighting",
    "credits": 8,
    "X": 1,
    "Y": 2,
    "type": 15,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E28000.gif",
    "exlThumb": "/items/00E28000.gif"
  },
  {
    "uid": 404,
    "id": 3,
    "name": "Scroll of Fire Ball",
    "credits": 5,
    "X": 1,
    "Y": 2,
    "type": 15,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E38000.gif",
    "exlThumb": "/items/00E38000.gif"
  },
  {
    "uid": 405,
    "id": 4,
    "name": "Scroll of Flame",
    "credits": 15,
    "X": 1,
    "Y": 2,
    "type": 15,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E48000.gif",
    "exlThumb": "/items/00E48000.gif"
  },
  {
    "uid": 406,
    "id": 5,
    "name": "Scroll of Teleport",
    "credits": 17,
    "X": 1,
    "Y": 2,
    "type": 15,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E58000.gif",
    "exlThumb": "/items/00E58000.gif"
  },
  {
    "uid": 407,
    "id": 6,
    "name": "Scroll of Ice",
    "credits": 20,
    "X": 1,
    "Y": 2,
    "type": 15,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E68000.gif",
    "exlThumb": "/items/00E68000.gif"
  },
  {
    "uid": 408,
    "id": 7,
    "name": "Scroll of Twister",
    "credits": 22,
    "X": 1,
    "Y": 2,
    "type": 15,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E78000.gif",
    "exlThumb": "/items/00E78000.gif"
  },
  {
    "uid": 409,
    "id": 8,
    "name": "Scroll of Evil Spirit",
    "credits": 25,
    "X": 1,
    "Y": 2,
    "type": 15,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E88000.gif",
    "exlThumb": "/items/00E88000.gif"
  },
  {
    "uid": 410,
    "id": 9,
    "name": "Scroll of Hellfire",
    "credits": 30,
    "X": 1,
    "Y": 2,
    "type": 15,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E98000.gif",
    "exlThumb": "/items/00E98000.gif"
  },
  {
    "uid": 411,
    "id": 10,
    "name": "Scroll of Power Wave",
    "credits": 9,
    "X": 1,
    "Y": 2,
    "type": 15,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00EA8000.gif",
    "exlThumb": "/items/00EA8000.gif"
  },
  {
    "uid": 412,
    "id": 11,
    "name": "Scroll of Aqua Beam",
    "credits": 74,
    "X": 1,
    "Y": 2,
    "type": 15,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00EB8000.gif",
    "exlThumb": "/items/00EB8000.gif"
  },
  {
    "uid": 413,
    "id": 12,
    "name": "Scroll of Cometfall",
    "credits": 80,
    "X": 1,
    "Y": 2,
    "type": 15,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00EC8000.gif",
    "exlThumb": "/items/00EC8000.gif"
  },
  {
    "uid": 414,
    "id": 13,
    "name": "Scroll of Inferno",
    "credits": 88,
    "X": 1,
    "Y": 2,
    "type": 15,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00ED8000.gif",
    "exlThumb": "/items/00ED8000.gif"
  },
  {
    "uid": 415,
    "id": 14,
    "name": "Scroll of Teleport Ally",
    "credits": 83,
    "X": 1,
    "Y": 2,
    "type": 15,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00EE8000.gif",
    "exlThumb": "/items/00EE8000.gif"
  },
  {
    "uid": 416,
    "id": 15,
    "name": "Scroll of Soul Barrier",
    "credits": 77,
    "X": 1,
    "Y": 2,
    "type": 15,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00EF8000.gif",
    "exlThumb": "/items/00EF8000.gif"
  },
  {
    "uid": 417,
    "id": 16,
    "name": "Scroll of Decay",
    "credits": 96,
    "X": 1,
    "Y": 2,
    "type": 15,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00F08000.gif",
    "exlThumb": "/items/00F08000.gif"
  },
  {
    "uid": 418,
    "id": 17,
    "name": "Scroll of Ice Storm",
    "credits": 93,
    "X": 1,
    "Y": 2,
    "type": 15,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00F18000.gif",
    "exlThumb": "/items/00F18000.gif"
  },
  {
    "uid": 419,
    "id": 18,
    "name": "Scroll of Nova",
    "credits": 100,
    "X": 1,
    "Y": 2,
    "type": 15,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 15,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00F28000.gif",
    "exlThumb": "/items/00F28000.gif"
  },
  {
    "uid": 420,
    "id": 37,
    "name": "Sapphire Armor",
    "credits": 150,
    "X": 2,
    "Y": 3,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/000580F9.gif",
    "exlThumb": "/items/000580F9.gif"
  },
  {
    "uid": 421,
    "id": 37,
    "name": "Sapphire Pants",
    "credits": 140,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/002580F9.gif",
    "exlThumb": "/items/002580F9.gif"
  },
  {
    "uid": 422,
    "id": 37,
    "name": "Sapphire Gloves",
    "credits": 135,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/004580F9.gif",
    "exlThumb": "/items/004580F9.gif"
  },
  {
    "uid": 423,
    "id": 37,
    "name": "Sapphire Boots",
    "credits": 139,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/006580F9.gif",
    "exlThumb": "/items/006580F9.gif"
  },
  {
    "uid": 424,
    "id": 38,
    "name": "Shadow Gold Helm",
    "credits": 145,
    "X": 2,
    "Y": 2,
    "type": 7,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 7,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E600F9.gif",
    "exlThumb": "/items/00E600F9.gif"
  },
  {
    "uid": 425,
    "id": 38,
    "name": "Shadow Gold Armor",
    "credits": 151,
    "X": 2,
    "Y": 3,
    "type": 8,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 8,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/000680F9.gif",
    "exlThumb": "/items/000680F9.gif"
  },
  {
    "uid": 426,
    "id": 38,
    "name": "Shadow Gold Pants",
    "credits": 140,
    "X": 2,
    "Y": 2,
    "type": 9,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 9,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/002680F9.gif",
    "exlThumb": "/items/002680F9.gif"
  },
  {
    "uid": 427,
    "id": 38,
    "name": "Shadow Gold Gloves",
    "credits": 136,
    "X": 2,
    "Y": 2,
    "type": 10,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 10,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/004680F9.gif",
    "exlThumb": "/items/004680F9.gif"
  },
  {
    "uid": 428,
    "id": 38,
    "name": "Shadow Gold Boots",
    "credits": 143,
    "X": 2,
    "Y": 2,
    "type": 11,
    "ex_type": 1,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 11,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/006680F9.gif",
    "exlThumb": "/items/006680F9.gif"
  },
  {
    "uid": 429,
    "id": 14,
    "name": "Jewel of Soul",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00CE8000.gif",
    "exlThumb": "/items/00CE8000.gif"
  },
  {
    "uid": 430,
    "id": 14,
    "name": "Crest of Monarch",
    "credits": 17,
    "X": 1,
    "Y": 2,
    "type": 12,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 14,
    "stickLevel": 1,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00AE800001.gif",
    "exlThumb": "/items/00AE800001.gif"
  },
  {
    "uid": 431,
    "id": 11,
    "name": "Box Of Kundun +1",
    "credits": 10,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 12,
    "stickLevel": 8,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00CB800008.gif",
    "exlThumb": "/items/00CB800008.gif"
  },
  {
    "uid": 432,
    "id": 11,
    "name": "Box Of Kundun +2",
    "credits": 13,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 12,
    "stickLevel": 9,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00CB800009.gif",
    "exlThumb": "/items/00CB800009.gif"
  },
  {
    "uid": 433,
    "id": 11,
    "name": "Box Of Kundun +3",
    "credits": 15,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 12,
    "stickLevel": 10,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00CB800009.gif",
    "exlThumb": "/items/00CB800009.gif"
  },
  {
    "uid": 434,
    "id": 11,
    "name": "Box Of Kundun +4",
    "credits": 17,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 12,
    "stickLevel": 11,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00CB800009.gif",
    "exlThumb": "/items/00CB800009.gif"
  },
  {
    "uid": 435,
    "id": 11,
    "name": "Box Of Kundun +5",
    "credits": 20,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 12,
    "stickLevel": 12,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00CB800009.gif",
    "exlThumb": "/items/00CB800009.gif"
  },
  {
    "uid": 436,
    "id": 30,
    "name": "Jewel Of Bless Bundle +1",
    "credits": 25,
    "X": 1,
    "Y": 1,
    "type": 14,
    "ex_type": -1,
    "str": 0,
    "agi": 1,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/009E800000.gif",
    "exlThumb": "/items/009E800000.gif"
  },
  {
    "uid": 437,
    "id": 30,
    "name": "Jewel Of Bless Bundle +2",
    "credits": 50,
    "X": 1,
    "Y": 1,
    "type": 14,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 1,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/009E800001.gif",
    "exlThumb": "/items/009E800001.gif"
  },
  {
    "uid": 438,
    "id": 30,
    "name": "Jewel Of Bless Bundle +3",
    "credits": 75,
    "X": 1,
    "Y": 1,
    "type": 14,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 2,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/009E800002.gif",
    "exlThumb": "/items/009E800002.gif"
  },
  {
    "uid": 439,
    "id": 31,
    "name": "Jewel Of Soul Bundle +1",
    "credits": 25,
    "X": 1,
    "Y": 1,
    "type": 14,
    "ex_type": -1,
    "str": 0,
    "agi": 1,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/009F800000.gif",
    "exlThumb": "/items/009F800000.gif"
  },
  {
    "uid": 440,
    "id": 31,
    "name": "Jewel Of Soul Bundle +2",
    "credits": 50,
    "X": 1,
    "Y": 1,
    "type": 14,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 1,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/009F800001.gif",
    "exlThumb": "/items/009F800001.gif"
  },
  {
    "uid": 441,
    "id": 31,
    "name": "Jewel Of Soul Bundle +3",
    "credits": 75,
    "X": 1,
    "Y": 1,
    "type": 14,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 2,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/009F800002.gif",
    "exlThumb": "/items/009F800002.gif"
  },
  {
    "uid": 442,
    "id": 36,
    "name": "Storm Wings",
    "credits": 250,
    "X": 4,
    "Y": 3,
    "type": 14,
    "ex_type": 4,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 14,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/008480F9.gif",
    "exlThumb": "/items/008480F9.gif"
  },
  {
    "uid": 443,
    "id": 37,
    "name": "Space wings",
    "credits": 250,
    "X": 4,
    "Y": 3,
    "type": 14,
    "ex_type": 4,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 14,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/008580F9.gif",
    "exlThumb": "/items/008580F9.gif"
  },
  {
    "uid": 444,
    "id": 38,
    "name": "Illusion Wings",
    "credits": 250,
    "X": 4,
    "Y": 3,
    "type": 14,
    "ex_type": 4,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 14,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/008680F9.gif",
    "exlThumb": "/items/008680F9.gif"
  },
  {
    "uid": 445,
    "id": 39,
    "name": "Hurricane Wings",
    "credits": 250,
    "X": 4,
    "Y": 3,
    "type": 14,
    "ex_type": 4,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 14,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/008780F9.gif",
    "exlThumb": "/items/008780F9.gif"
  },
  {
    "uid": 446,
    "id": 40,
    "name": "Mantle Of Monarch",
    "credits": 280,
    "X": 2,
    "Y": 4,
    "type": 14,
    "ex_type": 4,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 0,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 1,
    "optionType": 0,
    "category": 14,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/008880F9.gif",
    "exlThumb": "/items/008880F9.gif"
  },
  {
    "uid": 447,
    "id": 84,
    "name": "Isis Crystal",
    "credits": 0,
    "X": 1,
    "Y": 2,
    "type": 14,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 13,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00B480F9.gif",
    "exlThumb": "/items/00B480F9.gif"
  },
  {
    "uid": 448,
    "id": 85,
    "name": "Condor Flame",
    "credits": 0,
    "X": 1,
    "Y": 2,
    "type": 14,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 14,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00B580F9.gif",
    "exlThumb": "/items/00B580F9.gif"
  },
  {
    "uid": 449,
    "id": 65,
    "name": "Flame Of Death Vim Knight",
    "credits": 0,
    "X": 1,
    "Y": 1,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 14,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E180F9.gif",
    "exlThumb": "/items/00E180F9.gif"
  },
  {
    "uid": 450,
    "id": 66,
    "name": "Horn Of Hell Maine",
    "credits": 0,
    "X": 1,
    "Y": 2,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 14,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E280F9.gif",
    "exlThumb": "/items/00E280F9.gif"
  },
  {
    "uid": 451,
    "id": 67,
    "name": "Feather of Phoenix Of Darkness",
    "credits": 0,
    "X": 1,
    "Y": 2,
    "type": 13,
    "ex_type": -1,
    "str": 0,
    "agi": 0,
    "luck": 0,
    "skill": 0,
    "hasLevel": 0,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 14,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "class": 0,
    "groupid": 0,
    "thumb": "/items/00E380F9.gif",
    "exlThumb": "/items/00E380F9.gif"
  },
  {
    "uid": 893,
    "id": 36,
    "name": "Wings Of Storm",
    "credits": 250,
    "X": 4,
    "Y": 3,
    "type": 14,
    "ex_type": 2,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 14,
    "stickLevel": 2,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "groupid": 0,
    "class": 0,
    "thumb": "/items/008480F9.gif",
    "exlThumb": "/items/008480F9.gif"
  },
  {
    "uid": 894,
    "id": 37,
    "name": "Wings Of Space Time",
    "credits": 250,
    "X": 4,
    "Y": 3,
    "type": 14,
    "ex_type": 2,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 14,
    "stickLevel": 2,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "groupid": 0,
    "class": 0,
    "thumb": "/items/008580F9.gif",
    "exlThumb": "/items/008580F9.gif"
  },
  {
    "uid": 895,
    "id": 38,
    "name": "Wings Of Illusion",
    "credits": 250,
    "X": 4,
    "Y": 3,
    "type": 14,
    "ex_type": 2,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 14,
    "stickLevel": 2,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "groupid": 0,
    "class": 0,
    "thumb": "/items/008680F9.gif",
    "exlThumb": "/items/008680F9.gif"
  },
  {
    "uid": 896,
    "id": 39,
    "name": "Wings Of Hurricane",
    "credits": 250,
    "X": 4,
    "Y": 3,
    "type": 14,
    "ex_type": 2,
    "str": 0,
    "agi": 0,
    "luck": 1,
    "skill": 1,
    "hasLevel": 1,
    "default_durability": 1,
    "nrg": 0,
    "cmd": 0,
    "hasOption": 0,
    "optionType": 0,
    "category": 14,
    "stickLevel": 0,
    "maxitop": 0,
    "maxitlv": 0,
    "maxitxl": 0,
    "cansellitem": 1,
    "groupid": 0,
    "class": 0,
    "thumb": "/items/008780F9.gif",
    "exlThumb": "/items/008780F9.gif"
  }
];

// src/data/initialState.ts
var DEFAULT_WEBSHOP_CONFIG = {
  credits: {
    reset: 200,
    // Cost to Reset Points
    buychar400: 500,
    // 500 Credits: Buy Level 400 Class 3 Character
    deletechar400: 300,
    // 300 Credits: Delete Level 400 Character reward
    onlineHourReward: 5,
    // 5 Credits per 1 Hour Online
    classchg: 1e3,
    itemexl: 15,
    itemluck: 15,
    itemskill: 13,
    itemlvl: 4,
    itemopt: 5,
    ancient1: 13,
    ancient2: 20,
    unbanchar: 100,
    // 100 Credits: Unban Character fee
    points: 20,
    multiplier: 1,
    zerocredit: 0,
    fenrir_destroy: 40,
    fenrir_protect: 40,
    golden_fenrir: 45,
    zen: 1e7,
    // 1 Credit = 10M Zen -> 50 Credits = 500M Zen
    zenPackageCredits: 50,
    zenPackageAmount: 5e8,
    // 500M Zen
    sellback_Q: 0.5,
    namechg: 1e3,
    vipMonthlyCost: 800
    // 800 Credits / month (30 days)
  },
  limit: {
    item_level: 13,
    item_option: 7,
    item_excellent: 3,
    // Max 3 Excellent options per item
    zen_limit: 9e8
    // 900M Warehouse Zen Maximum Limit
  },
  misc: {
    title: "Welcome to Mu Origins",
    admins: "admin,admin01",
    servername: "Continent of Mu Origins S6E3",
    serverlink: "#",
    topcredits: 20,
    s3classes: true,
    solidbans: "",
    bannedcode: 1,
    whshow: true,
    addshow: true
  }
};
function buildInitialGroups() {
  const bdNames = [
    "Black Dragon Helm",
    "Black Dragon Armor",
    "Black Dragon Pants",
    "Black Dragon Gloves",
    "Black Dragon Boots"
  ];
  const gsNames = [
    "Grand Soul Helm",
    "Grand Soul Armor",
    "Grand Soul Pants",
    "Grand Soul Gloves",
    "Grand Soul Boots"
  ];
  const dpNames = [
    "Dark Phoenix Helm",
    "Dark Phoenix Armor",
    "Dark Phoenix Pants",
    "Dark Phoenix Gloves",
    "Dark Phoenix Boots"
  ];
  const dmNames = [
    "Dark Master Mask",
    "Dark Master Armor",
    "Dark Master Pants",
    "Dark Master Gloves",
    "Dark Master Boots"
  ];
  const getUids = (names) => names.map((n) => INITIAL_WEBSHOP_ITEMS.find((i) => i.name.toLowerCase() === n.toLowerCase())?.uid).filter((u) => Boolean(u));
  const bdUids = getUids(bdNames);
  const gsUids = getUids(gsNames);
  const dpUids = getUids(dpNames);
  const dmUids = getUids(dmNames);
  return [
    {
      id: 1,
      name: "Black Dragon Full Set (5 pcs)",
      credits: 420,
      basedon: bdUids[1] || 1,
      memberUids: bdUids
    },
    {
      id: 2,
      name: "Grand Soul Full Set (5 pcs)",
      credits: 440,
      basedon: gsUids[1] || 1,
      memberUids: gsUids
    },
    {
      id: 3,
      name: "Dark Phoenix Full Set (5 pcs)",
      credits: 510,
      basedon: dpUids[1] || 1,
      memberUids: dpUids
    },
    {
      id: 4,
      name: "Dark Master Full Set (5 pcs)",
      credits: 620,
      basedon: dmUids[1] || 1,
      memberUids: dmUids
    }
  ];
}
var INITIAL_GROUPS = buildInitialGroups();
var INITIAL_LOGS = [];

// src/server/auditLogger.ts
var AUDIT_LOG_FILE = process.env.AUDIT_LOG_PATH || path.join(process.cwd(), "logs", "audit.ndjson");
var MAX_RING_BUFFER = 1e3;
var auditNumericSeq = INITIAL_LOGS.length;
var auditRingBuffer = INITIAL_LOGS.map((legacy) => ({
  id: `audit-seed-${legacy.id}`,
  numericId: legacy.id,
  accountId: legacy.accountId,
  ipAddress: "127.0.0.1",
  action: legacy.itemSerial ? "ITEM_PURCHASE" : "ACCOUNT_SERVICE",
  status: "COMMITTED",
  itemHex: null,
  itemSerial: legacy.itemSerial || null,
  creditsDelta: 0,
  wCoinCDelta: 0,
  idempotencyKey: null,
  details: legacy.details,
  timestampIso: new Date(legacy.dateline * 1e3).toISOString(),
  dateline: legacy.dateline
})).sort((a, b) => b.dateline - a.dateline);
var logDirInitialized = false;
var writeQueue = Promise.resolve();
async function appendAuditLineToFile(entry) {
  try {
    if (!logDirInitialized) {
      await fs.promises.mkdir(path.dirname(AUDIT_LOG_FILE), { recursive: true });
      logDirInitialized = true;
    }
    const line = `${JSON.stringify(entry)}
`;
    await fs.promises.appendFile(AUDIT_LOG_FILE, line, { encoding: "utf8", mode: 416 });
  } catch (err) {
    console.warn(
      "[AuditLogger] File append warning:",
      err instanceof Error ? err.message : err
    );
  }
}
async function recordAuditLog(params, dbExecutor) {
  const nowMs = Date.now();
  auditNumericSeq += 1;
  const entry = {
    id: crypto2.randomUUID(),
    numericId: auditNumericSeq,
    accountId: (params.accountId || "anonymous").slice(0, 32),
    ipAddress: (params.ipAddress || "0.0.0.0").slice(0, 64),
    action: params.action.slice(0, 64),
    status: params.status,
    itemHex: params.itemHex ? params.itemHex.toUpperCase().slice(0, 512) : null,
    itemSerial: params.itemSerial ? params.itemSerial.toUpperCase().slice(0, 16) : null,
    creditsDelta: Math.trunc(params.creditsDelta || 0),
    wCoinCDelta: Math.trunc(params.wCoinCDelta || 0),
    idempotencyKey: params.idempotencyKey ? params.idempotencyKey.slice(0, 128) : null,
    details: params.details.slice(0, 1e3),
    timestampIso: new Date(nowMs).toISOString(),
    dateline: Math.floor(nowMs / 1e3)
  };
  if (dbExecutor) {
    try {
      await dbExecutor.query(
        `INSERT INTO webshop_audit_logs (
          id, account_id, ip_address, action, status,
          item_hex, item_serial, credits_delta, wcoinc_delta,
          idempotency_key, details, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          entry.id,
          entry.accountId,
          entry.ipAddress,
          entry.action,
          entry.status,
          entry.itemHex,
          entry.itemSerial,
          entry.creditsDelta,
          entry.wCoinCDelta,
          entry.idempotencyKey,
          entry.details,
          entry.timestampIso
        ]
      );
    } catch (dbErr) {
      console.error(
        "[AuditLogger] Failed to write audit row to PostgreSQL:",
        dbErr instanceof Error ? dbErr.message : dbErr
      );
    }
  }
  auditRingBuffer.unshift(entry);
  if (auditRingBuffer.length > MAX_RING_BUFFER) {
    auditRingBuffer.length = MAX_RING_BUFFER;
  }
  writeQueue = writeQueue.then(() => appendAuditLineToFile(entry));
  return entry;
}
function getRecentAuditLogs(limit = 200, accountFilter) {
  const safeLimit = Math.max(1, Math.min(MAX_RING_BUFFER, limit));
  if (!accountFilter || !accountFilter.trim()) {
    return auditRingBuffer.slice(0, safeLimit);
  }
  const normalized = accountFilter.trim().toLowerCase();
  return auditRingBuffer.filter((e) => e.accountId.toLowerCase() === normalized).slice(0, safeLimit);
}

// src/server/dbRepository.ts
import crypto4 from "crypto";
import bcrypt from "bcryptjs";
import pg from "pg";

// src/utils/muItemLogic.ts
var CATEGORY_NAMES = {
  0: {
    en: "Swords",
    th: "\u0E14\u0E32\u0E1A (Swords)",
    pt: "Espadas (Swords)",
    ru: "\u041C\u0435\u0447\u0438 (Swords)",
    es: "Espadas (Swords)",
    bg: "\u041C\u0435\u0447\u043E\u0432\u0435 (Swords)"
  },
  1: {
    en: "Axes",
    th: "\u0E02\u0E27\u0E32\u0E19 (Axes)",
    pt: "Machados (Axes)",
    ru: "\u0422\u043E\u043F\u043E\u0440\u044B (Axes)",
    es: "Hachas (Axes)",
    bg: "\u0411\u0440\u0430\u0434\u0432\u0438 (Axes)"
  },
  2: {
    en: "Maces",
    th: "\u0E01\u0E23\u0E30\u0E1A\u0E2D\u0E07\u0E41\u0E25\u0E30\u0E04\u0E49\u0E2D\u0E19 (Maces)",
    pt: "Ma\xE7as e Cetros (Maces)",
    ru: "\u0411\u0443\u043B\u0430\u0432\u044B \u0438 \u041C\u043E\u043B\u043E\u0442\u044B (Maces)",
    es: "Mazas y Martillos (Maces)",
    bg: "\u0411\u043E\u0437\u0434\u0443\u0433\u0430\u043D\u0438 (Maces)"
  },
  3: {
    en: "Spears",
    th: "\u0E2B\u0E2D\u0E01\u0E41\u0E25\u0E30\u0E17\u0E27\u0E19 (Spears)",
    pt: "Lan\xE7as (Spears)",
    ru: "\u041A\u043E\u043F\u044C\u044F (Spears)",
    es: "Lanzas (Spears)",
    bg: "\u041A\u043E\u043F\u0438\u044F (Spears)"
  },
  4: {
    en: "Bows & Crossbows",
    th: "\u0E18\u0E19\u0E39\u0E41\u0E25\u0E30\u0E2B\u0E19\u0E49\u0E32\u0E44\u0E21\u0E49 (Bows & Crossbows)",
    pt: "Arcos e Bestas (Bows)",
    ru: "\u041B\u0443\u043A\u0438 \u0438 \u0410\u0440\u0431\u0430\u043B\u0435\u0442\u044B (Bows)",
    es: "Arcos y Ballestas (Bows)",
    bg: "\u041B\u044A\u043A\u043E\u0432\u0435 \u0438 \u0410\u0440\u0431\u0430\u043B\u0435\u0442\u0438 (Bows)"
  },
  5: {
    en: "Staffs",
    th: "\u0E04\u0E17\u0E32\u0E40\u0E27\u0E17\u0E22\u0E4C (Staffs)",
    pt: "Cajados (Staffs)",
    ru: "\u041F\u043E\u0441\u043E\u0445\u0438 (Staffs)",
    es: "B\xE1culos (Staffs)",
    bg: "\u0416\u0435\u0437\u043B\u0438 (Staffs)"
  },
  6: {
    en: "Helmets",
    th: "\u0E2B\u0E21\u0E27\u0E01\u0E40\u0E01\u0E23\u0E32\u0E30 (Helmets)",
    pt: "Elmos (Helmets)",
    ru: "\u0428\u043B\u0435\u043C\u044B (Helmets)",
    es: "Cascos (Helmets)",
    bg: "\u0428\u043B\u0435\u043C\u043E\u0432\u0435 (Helmets)"
  },
  7: {
    en: "Armors",
    th: "\u0E40\u0E2A\u0E37\u0E49\u0E2D\u0E40\u0E01\u0E23\u0E32\u0E30 (Armors)",
    pt: "Armaduras (Armors)",
    ru: "\u0411\u0440\u043E\u043D\u044F (Armors)",
    es: "Armaduras (Armors)",
    bg: "\u0411\u0440\u043E\u043D\u0438 (Armors)"
  },
  8: {
    en: "Gloves",
    th: "\u0E16\u0E38\u0E07\u0E21\u0E37\u0E2D (Gloves)",
    pt: "Luvas (Gloves)",
    ru: "\u041F\u0435\u0440\u0447\u0430\u0442\u043A\u0438 (Gloves)",
    es: "Guantes (Gloves)",
    bg: "\u0420\u044A\u043A\u0430\u0432\u0438\u0446\u0438 (Gloves)"
  },
  9: {
    en: "Pants",
    th: "\u0E01\u0E32\u0E07\u0E40\u0E01\u0E07\u0E40\u0E01\u0E23\u0E32\u0E30 (Pants)",
    pt: "Cal\xE7as (Pants)",
    ru: "\u0428\u0442\u0430\u043D\u044B (Pants)",
    es: "Pantalones (Pants)",
    bg: "\u041F\u0430\u043D\u0442\u0430\u043B\u043E\u043D\u0438 (Pants)"
  },
  10: {
    en: "Boots",
    th: "\u0E23\u0E2D\u0E07\u0E40\u0E17\u0E49\u0E32\u0E40\u0E01\u0E23\u0E32\u0E30 (Boots)",
    pt: "Botas (Boots)",
    ru: "\u0411\u043E\u0442\u0438\u043D\u043A\u0438 (Boots)",
    es: "Botas (Boots)",
    bg: "\u0411\u043E\u0442\u0443\u0448\u0438 (Boots)"
  },
  11: {
    en: "Shields",
    th: "\u0E42\u0E25\u0E48\u0E1B\u0E49\u0E2D\u0E07\u0E01\u0E31\u0E19 (Shields)",
    pt: "Escudos (Shields)",
    ru: "\u0429\u0438\u0442\u044B (Shields)",
    es: "Escudos (Shields)",
    bg: "\u0429\u0438\u0442\u043E\u0432\u0435 (Shields)"
  },
  12: {
    en: "Rings, Pendants, Others",
    th: "\u0E41\u0E2B\u0E27\u0E19 \u0E2A\u0E23\u0E49\u0E2D\u0E22 \u0E41\u0E25\u0E30\u0E2A\u0E31\u0E15\u0E27\u0E4C\u0E02\u0E35\u0E48 (Rings & Pets)",
    pt: "An\xE9is, Pendants e Pets",
    ru: "\u041A\u043E\u043B\u044C\u0446\u0430, \u0410\u043C\u0443\u043B\u0435\u0442\u044B \u0438 \u041F\u0438\u0442\u043E\u043C\u0446\u044B",
    es: "Anillos, Colgantes y Mascotas",
    bg: "\u041F\u0440\u044A\u0441\u0442\u0435\u043D\u0438, \u0410\u043C\u0443\u043B\u0435\u0442\u0438 \u0438 \u041B\u044E\u0431\u0438\u043C\u0446\u0438"
  },
  13: {
    en: "Jewels, Quest",
    th: "\u0E40\u0E1E\u0E0A\u0E23\u0E41\u0E25\u0E30\u0E44\u0E2D\u0E40\u0E17\u0E21\u0E40\u0E04\u0E27\u0E2A (Jewels & Quest)",
    pt: "Joias e Itens de Quest",
    ru: "\u041A\u0430\u043C\u043D\u0438 \u0438 \u041A\u0432\u0435\u0441\u0442\u043E\u0432\u044B\u0435 \u043F\u0440\u0435\u0434\u043C\u0435\u0442\u044B",
    es: "Joyas e \xCDtems de Misi\xF3n",
    bg: "\u041A\u0430\u043C\u044A\u043D\u0438 \u0438 \u041F\u0440\u0435\u0434\u043C\u0435\u0442\u0438 \u0437\u0430 \u041A\u0443\u0435\u0441\u0442\u043E\u0432\u0435"
  },
  14: {
    en: "Wings, Capes",
    th: "\u0E1B\u0E35\u0E01\u0E41\u0E25\u0E30\u0E1C\u0E49\u0E32\u0E04\u0E25\u0E38\u0E21 (Wings & Capes)",
    pt: "Asas e Capas (Wings)",
    ru: "\u041A\u0440\u044B\u043B\u044C\u044F \u0438 \u041F\u043B\u0430\u0449\u0438 (Wings)",
    es: "Alas y Capas (Wings)",
    bg: "\u041A\u0440\u0438\u043B\u0430 \u0438 \u041D\u0430\u043C\u0435\u0442\u0430\u043B\u0430 (Wings)"
  },
  15: {
    en: "Scrolls, Orbs, Consumables",
    th: "\u0E04\u0E31\u0E21\u0E20\u0E35\u0E23\u0E4C\u0E40\u0E27\u0E17\u0E22\u0E4C\u0E41\u0E25\u0E30\u0E25\u0E39\u0E01\u0E41\u0E01\u0E49\u0E27 (Scrolls & Orbs)",
    pt: "Pergaminhos e Orbs",
    ru: "\u0421\u0432\u0438\u0442\u043A\u0438 \u0438 \u0421\u0444\u0435\u0440\u044B \u0437\u0430\u043A\u043B\u0438\u043D\u0430\u043D\u0438\u0439",
    es: "Pergaminos y Orbes",
    bg: "\u0421\u0432\u0438\u0442\u044A\u0446\u0438 \u0438 \u041A\u044A\u043B\u0431\u0430"
  }
};
var INITIAL_STARTING_POINTS = 300;
var BUY_CHAR_400_CREDITS = 500;
var DELETE_CHAR_400_REWARD_CREDITS = 300;
var ONLINE_HOUR_REWARD_CREDITS = 5;
var MU_CLASSES = [
  {
    code: "dw",
    id: 0,
    name: "Dark Wizard",
    nameTh: "\u0E19\u0E31\u0E01\u0E40\u0E27\u0E17\u0E22\u0E4C (Dark Wizard)",
    s3: false,
    pointsPerLevel: 5,
    hasMarlonAndClass2Quest: true,
    baseStr: 18,
    baseAgi: 18,
    baseVit: 15,
    baseEne: 30,
    baseCmd: 0,
    tierLabel: "\u0E04\u0E25\u0E32\u0E2A 1 (5 \u0E1E\u0E2D\u0E22\u0E15\u0E4C/\u0E40\u0E25\u0E40\u0E27\u0E25)"
  },
  {
    code: "sm",
    id: 1,
    name: "Soul Master",
    nameTh: "\u0E42\u0E0B\u0E25\u0E21\u0E32\u0E2A\u0E40\u0E15\u0E2D\u0E23\u0E4C (Soul Master)",
    s3: false,
    pointsPerLevel: 5,
    hasMarlonAndClass2Quest: true,
    baseStr: 18,
    baseAgi: 18,
    baseVit: 15,
    baseEne: 30,
    baseCmd: 0,
    tierLabel: "\u0E04\u0E25\u0E32\u0E2A 2 (\u0E10\u0E32\u0E19 5 \u0E1E\u0E2D\u0E22\u0E15\u0E4C/\u0E40\u0E25\u0E40\u0E27\u0E25)"
  },
  {
    code: "gm",
    id: 2,
    name: "Grand Master",
    nameTh: "\u0E41\u0E01\u0E23\u0E19\u0E14\u0E4C\u0E21\u0E32\u0E2A\u0E40\u0E15\u0E2D\u0E23\u0E4C (Grand Master)",
    s3: true,
    pointsPerLevel: 5,
    hasMarlonAndClass2Quest: true,
    baseStr: 18,
    baseAgi: 18,
    baseVit: 15,
    baseEne: 30,
    baseCmd: 0,
    tierLabel: "\u0E04\u0E25\u0E32\u0E2A 3 (\u0E10\u0E32\u0E19 5 \u0E1E\u0E2D\u0E22\u0E15\u0E4C/\u0E40\u0E25\u0E40\u0E27\u0E25)"
  },
  {
    code: "dk",
    id: 16,
    name: "Dark Knight",
    nameTh: "\u0E19\u0E31\u0E01\u0E23\u0E1A (Dark Knight)",
    s3: false,
    pointsPerLevel: 5,
    hasMarlonAndClass2Quest: true,
    baseStr: 28,
    baseAgi: 20,
    baseVit: 25,
    baseEne: 10,
    baseCmd: 0,
    tierLabel: "\u0E04\u0E25\u0E32\u0E2A 1 (5 \u0E1E\u0E2D\u0E22\u0E15\u0E4C/\u0E40\u0E25\u0E40\u0E27\u0E25)"
  },
  {
    code: "bk",
    id: 17,
    name: "Blade Knight",
    nameTh: "\u0E40\u0E1A\u0E25\u0E14\u0E44\u0E19\u0E17\u0E4C (Blade Knight)",
    s3: false,
    pointsPerLevel: 5,
    hasMarlonAndClass2Quest: true,
    baseStr: 28,
    baseAgi: 20,
    baseVit: 25,
    baseEne: 10,
    baseCmd: 0,
    tierLabel: "\u0E04\u0E25\u0E32\u0E2A 2 (\u0E10\u0E32\u0E19 5 \u0E1E\u0E2D\u0E22\u0E15\u0E4C/\u0E40\u0E25\u0E40\u0E27\u0E25)"
  },
  {
    code: "bm",
    id: 18,
    name: "Blade Master",
    nameTh: "\u0E40\u0E1A\u0E25\u0E14\u0E21\u0E32\u0E2A\u0E40\u0E15\u0E2D\u0E23\u0E4C (Blade Master)",
    s3: true,
    pointsPerLevel: 5,
    hasMarlonAndClass2Quest: true,
    baseStr: 28,
    baseAgi: 20,
    baseVit: 25,
    baseEne: 10,
    baseCmd: 0,
    tierLabel: "\u0E04\u0E25\u0E32\u0E2A 3 (\u0E10\u0E32\u0E19 5 \u0E1E\u0E2D\u0E22\u0E15\u0E4C/\u0E40\u0E25\u0E40\u0E27\u0E25)"
  },
  {
    code: "elf",
    id: 32,
    name: "Fairy Elf",
    nameTh: "\u0E40\u0E2D\u0E25\u0E1F\u0E4C (Fairy Elf)",
    s3: false,
    pointsPerLevel: 5,
    hasMarlonAndClass2Quest: true,
    baseStr: 22,
    baseAgi: 25,
    baseVit: 20,
    baseEne: 15,
    baseCmd: 0,
    tierLabel: "\u0E04\u0E25\u0E32\u0E2A 1 (5 \u0E1E\u0E2D\u0E22\u0E15\u0E4C/\u0E40\u0E25\u0E40\u0E27\u0E25)"
  },
  {
    code: "me",
    id: 33,
    name: "Muse Elf",
    nameTh: "\u0E21\u0E34\u0E27\u0E2A\u0E4C\u0E40\u0E2D\u0E25\u0E1F\u0E4C (Muse Elf)",
    s3: false,
    pointsPerLevel: 5,
    hasMarlonAndClass2Quest: true,
    baseStr: 22,
    baseAgi: 25,
    baseVit: 20,
    baseEne: 15,
    baseCmd: 0,
    tierLabel: "\u0E04\u0E25\u0E32\u0E2A 2 (\u0E10\u0E32\u0E19 5 \u0E1E\u0E2D\u0E22\u0E15\u0E4C/\u0E40\u0E25\u0E40\u0E27\u0E25)"
  },
  {
    code: "he",
    id: 34,
    name: "High Elf",
    nameTh: "\u0E44\u0E2E\u0E40\u0E2D\u0E25\u0E1F\u0E4C (High Elf)",
    s3: true,
    pointsPerLevel: 5,
    hasMarlonAndClass2Quest: true,
    baseStr: 22,
    baseAgi: 25,
    baseVit: 20,
    baseEne: 15,
    baseCmd: 0,
    tierLabel: "\u0E04\u0E25\u0E32\u0E2A 3 (\u0E10\u0E32\u0E19 5 \u0E1E\u0E2D\u0E22\u0E15\u0E4C/\u0E40\u0E25\u0E40\u0E27\u0E25)"
  },
  {
    code: "mg",
    id: 48,
    name: "Magic Gladiator",
    nameTh: "\u0E40\u0E21\u0E08\u0E34\u0E01\u0E01\u0E25\u0E32\u0E14\u0E34\u0E40\u0E2D\u0E40\u0E15\u0E2D\u0E23\u0E4C (Magic Gladiator)",
    s3: false,
    pointsPerLevel: 7,
    hasMarlonAndClass2Quest: false,
    baseStr: 26,
    baseAgi: 26,
    baseVit: 26,
    baseEne: 26,
    baseCmd: 0,
    tierLabel: "\u0E2D\u0E32\u0E0A\u0E35\u0E1E\u0E1E\u0E34\u0E40\u0E28\u0E29 (7 \u0E1E\u0E2D\u0E22\u0E15\u0E4C/\u0E40\u0E25\u0E40\u0E27\u0E25)"
  },
  {
    code: "dm",
    id: 50,
    name: "Duel Master",
    nameTh: "\u0E14\u0E39\u0E40\u0E2D\u0E25\u0E21\u0E32\u0E2A\u0E40\u0E15\u0E2D\u0E23\u0E4C (Duel Master)",
    s3: true,
    pointsPerLevel: 7,
    hasMarlonAndClass2Quest: false,
    baseStr: 26,
    baseAgi: 26,
    baseVit: 26,
    baseEne: 26,
    baseCmd: 0,
    tierLabel: "\u0E04\u0E25\u0E32\u0E2A 3 \u0E1E\u0E34\u0E40\u0E28\u0E29 (7 \u0E1E\u0E2D\u0E22\u0E15\u0E4C/\u0E40\u0E25\u0E40\u0E27\u0E25)"
  },
  {
    code: "dl",
    id: 64,
    name: "Dark Lord",
    nameTh: "\u0E14\u0E32\u0E23\u0E4C\u0E04\u0E25\u0E2D\u0E23\u0E4C\u0E14 (Dark Lord)",
    s3: false,
    pointsPerLevel: 7,
    hasMarlonAndClass2Quest: false,
    baseStr: 26,
    baseAgi: 20,
    baseVit: 20,
    baseEne: 15,
    baseCmd: 25,
    tierLabel: "\u0E2D\u0E32\u0E0A\u0E35\u0E1E\u0E1E\u0E34\u0E40\u0E28\u0E29 (7 \u0E1E\u0E2D\u0E22\u0E15\u0E4C/\u0E40\u0E25\u0E40\u0E27\u0E25)"
  },
  {
    code: "le",
    id: 66,
    name: "Lord Emperor",
    nameTh: "\u0E25\u0E2D\u0E23\u0E4C\u0E14\u0E40\u0E2D\u0E47\u0E21\u0E40\u0E1E\u0E2D\u0E40\u0E23\u0E2D\u0E23\u0E4C (Lord Emperor)",
    s3: true,
    pointsPerLevel: 7,
    hasMarlonAndClass2Quest: false,
    baseStr: 26,
    baseAgi: 20,
    baseVit: 20,
    baseEne: 15,
    baseCmd: 25,
    tierLabel: "\u0E04\u0E25\u0E32\u0E2A 3 \u0E1E\u0E34\u0E40\u0E28\u0E29 (7 \u0E1E\u0E2D\u0E22\u0E15\u0E4C/\u0E40\u0E25\u0E40\u0E27\u0E25)"
  }
];
var CLASS_3_CLASSES = MU_CLASSES.filter(
  (c) => c.s3
);
function calculateClassStatPoints(classCode, level = 400) {
  const classDef = MU_CLASSES.find((c) => c.code === classCode) || MU_CLASSES[0];
  const safeLevel = Math.max(1, Math.min(400, level));
  const levelUps = Math.max(0, safeLevel - 1);
  const pointsPerLevel = classDef.pointsPerLevel;
  const startingPoints = INITIAL_STARTING_POINTS;
  const levelPoints = levelUps * pointsPerLevel;
  const totalPoints = startingPoints + levelPoints;
  const excludedClass2QuestPoints = classDef.hasMarlonAndClass2Quest ? 20 : 0;
  const excludedMarlon220Points = classDef.hasMarlonAndClass2Quest && safeLevel > 220 ? safeLevel - 220 : 0;
  const totalIfQuestsCompleted = totalPoints + excludedClass2QuestPoints + excludedMarlon220Points;
  return {
    classDef,
    level: safeLevel,
    levelUps,
    pointsPerLevel,
    startingPoints,
    levelPoints,
    totalPoints,
    excludedClass2QuestPoints,
    excludedMarlon220Points,
    totalIfQuestsCompleted
  };
}
function buildOccupancyMatrix(vaultItems) {
  const grid = Array.from(
    { length: 15 },
    () => Array.from({ length: 8 }, () => null)
  );
  for (const item of vaultItems) {
    const startX = item.slotIndex % 8;
    const startY = Math.floor(item.slotIndex / 8);
    for (let dy = 0; dy < item.Y; dy++) {
      for (let dx = 0; dx < item.X; dx++) {
        const y = startY + dy;
        const x = startX + dx;
        if (y < 15 && x < 8) {
          grid[y][x] = item;
        }
      }
    }
  }
  return grid;
}
function findFreeVaultSlot(vaultItems, itemX, itemY) {
  const grid = buildOccupancyMatrix(vaultItems);
  for (let row = 0; row <= 15 - itemY; row++) {
    for (let col = 0; col <= 8 - itemX; col++) {
      let fits = true;
      for (let dy = 0; dy < itemY && fits; dy++) {
        for (let dx = 0; dx < itemX; dx++) {
          if (grid[row + dy][col + dx] !== null) {
            fits = false;
            break;
          }
        }
      }
      if (fits) {
        return row * 8 + col;
      }
    }
  }
  return 1337;
}
function calculateItemTotalCredits(baseCredits, level, option, luck, skill, exlOptions, ancientStamina, fenrirVariant, config) {
  let total = Math.ceil(baseCredits * config.credits.multiplier);
  total += level * config.credits.itemlvl;
  total += option * config.credits.itemopt;
  if (luck) total += config.credits.itemluck;
  if (skill) total += config.credits.itemskill;
  const exCount = exlOptions.filter(Boolean).length;
  total += exCount * config.credits.itemexl;
  if (ancientStamina === 5) total += config.credits.ancient1;
  if (ancientStamina === 10) total += config.credits.ancient2;
  if (fenrirVariant === 1) total += config.credits.fenrir_destroy;
  if (fenrirVariant === 2) total += config.credits.fenrir_protect;
  if (fenrirVariant === 3) total += config.credits.golden_fenrir;
  return total;
}

// src/server/muItemHex.ts
import crypto3 from "crypto";
var WAREHOUSE_SLOT_COUNT = 120;
var S6_ITEM_BYTE_LENGTH = 16;
var EMPTY_S6_SLOT_HEX = "F".repeat(S6_ITEM_BYTE_LENGTH * 2);
var issuedSerials = /* @__PURE__ */ new Set([
  "00000000",
  "FFFFFFFF",
  "00A84F21",
  "00A84F22",
  "00B91E04",
  "00C73D90",
  "00D14A88",
  "00E52C11",
  "00E52C12",
  "00F77B01",
  "00991A01",
  "00991A02",
  "00772C05",
  "00772C09",
  "00334D01"
]);
var monotonicCounter = crypto3.randomInt(1048576, 268435455);
function generateUniqueItemSerial() {
  for (let attempt = 0; attempt < 64; attempt++) {
    monotonicCounter = monotonicCounter + 1 >>> 0;
    const entropy = crypto3.randomBytes(2).readUInt16BE(0);
    const combined = ((monotonicCounter & 65535) << 16 | entropy) >>> 0;
    if (combined === 0 || combined === 4294967295) continue;
    const hex = combined.toString(16).toUpperCase().padStart(8, "0");
    if (!issuedSerials.has(hex)) {
      issuedSerials.add(hex);
      return hex;
    }
  }
  throw new Error("SERIAL_GENERATION_EXHAUSTED");
}
function encodeSeason6ItemHex(item) {
  const buf = Buffer.alloc(S6_ITEM_BYTE_LENGTH, 0);
  const safeId = Math.max(0, Math.min(511, item.itemId));
  const safeType = Math.max(0, Math.min(15, item.itemType));
  const safeLevel = Math.max(0, Math.min(15, item.level));
  const safeOption = Math.max(0, Math.min(7, item.option));
  const safeDurability = Math.max(1, Math.min(255, item.durability || 255));
  buf[0] = safeId & 255;
  let byte1 = 0;
  if (item.skill) byte1 |= 128;
  byte1 |= (safeLevel & 15) << 3;
  if (item.luck) byte1 |= 4;
  byte1 |= safeOption & 3;
  buf[1] = byte1;
  buf[2] = safeDurability;
  const cleanSerial = /^[0-9A-Fa-f]{8}$/.test(item.serial) ? item.serial.toUpperCase() : generateUniqueItemSerial();
  const serialBytes = Buffer.from(cleanSerial, "hex");
  serialBytes.copy(buf, 3, 0, 4);
  let exlMask = 0;
  const isFenrir = safeType === 12 && safeId === 37;
  if (isFenrir) {
    if (item.fenrirVariant === 1) exlMask = 1;
    else if (item.fenrirVariant === 2) exlMask = 2;
    else if (item.fenrirVariant === 3) exlMask = 4;
  } else {
    for (let i = 0; i < 6; i++) {
      if (item.exlOptions[i]) {
        exlMask |= 1 << i;
      }
    }
  }
  let byte7 = exlMask & 63;
  if (safeOption >= 4) byte7 |= 64;
  if ((safeId & 256) !== 0) byte7 |= 128;
  buf[7] = byte7;
  buf[8] = item.ancientStamina === 10 ? 10 : item.ancientStamina === 5 ? 5 : 0;
  buf[9] = (safeType & 15) << 4;
  buf[10] = 0;
  buf[11] = 255;
  buf[12] = 255;
  buf[13] = 255;
  buf[14] = 255;
  buf[15] = 255;
  return buf.toString("hex").toUpperCase();
}
function encodeWarehouseHex3840(vaultItems) {
  const slots = new Array(WAREHOUSE_SLOT_COUNT).fill(EMPTY_S6_SLOT_HEX);
  for (const inst of vaultItems) {
    if (inst.slotIndex >= 0 && inst.slotIndex < WAREHOUSE_SLOT_COUNT) {
      slots[inst.slotIndex] = inst.itemHex || encodeSeason6ItemHex(inst);
    }
  }
  return slots.join("");
}
function verifySlotPlacement(existingItems, slotIndex, itemX, itemY) {
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= WAREHOUSE_SLOT_COUNT || itemX < 1 || itemX > 8 || itemY < 1 || itemY > 15) {
    return false;
  }
  const startCol = slotIndex % 8;
  const startRow = Math.floor(slotIndex / 8);
  if (startCol + itemX > 8 || startRow + itemY > 15) {
    return false;
  }
  const matrix = buildOccupancyMatrix(existingItems);
  for (let dy = 0; dy < itemY; dy++) {
    for (let dx = 0; dx < itemX; dx++) {
      if (matrix[startRow + dy][startCol + dx] !== null) {
        return false;
      }
    }
  }
  return true;
}
function locateFreeWarehouseSlot(existingItems, itemX, itemY) {
  return findFreeVaultSlot(existingItems, itemX, itemY);
}
function sanitizeAndPriceGroupSet(group, memberItems, rawOpts, config) {
  if (memberItems.length === 0) {
    throw new Error("EMPTY_ITEM_GROUP");
  }
  const baseItem = memberItems[0];
  const maxLv = baseItem.maxitlv > 0 ? baseItem.maxitlv : config.limit.item_level;
  const maxOp = baseItem.maxitop > 0 ? baseItem.maxitop : config.limit.item_option;
  const maxEx = Math.min(
    3,
    baseItem.maxitxl > 0 ? baseItem.maxitxl : config.limit.item_excellent
  );
  const level = Math.max(0, Math.min(maxLv, Math.trunc(Number(rawOpts.level) || 0)));
  const option = Math.max(0, Math.min(maxOp, Math.trunc(Number(rawOpts.option) || 0)));
  const luck = Boolean(rawOpts.luck);
  const exlOptions = Array.from(
    { length: 6 },
    (_, idx) => Boolean(rawOpts.exlOptions?.[idx])
  );
  if (exlOptions.filter(Boolean).length > maxEx) {
    throw new Error(`MAX_EXCELLENT_OPTIONS_EXCEEDED:${maxEx}`);
  }
  const ancientStamina = baseItem.ex_type === 3 && (rawOpts.ancientStamina === 5 || rawOpts.ancientStamina === 10) ? rawOpts.ancientStamina : 0;
  const totalCredits = calculateItemTotalCredits(
    group.credits,
    level,
    option,
    luck,
    false,
    exlOptions,
    ancientStamina,
    0,
    config
  );
  return {
    level,
    option,
    luck,
    exlOptions,
    ancientStamina,
    totalCredits
  };
}

// src/server/redisCache.ts
import Redis from "ioredis";
var memoryStore = /* @__PURE__ */ new Map();
var REDIS_URL = (process.env.REDIS_URL || "").trim();
var CATALOG_CACHE_TTL_SECONDS = Math.max(
  30,
  Number(process.env.REDIS_CATALOG_TTL_SECONDS) || 300
);
var redisClient = null;
var redisReady = false;
if (REDIS_URL) {
  try {
    redisClient = new Redis(REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 2500,
      retryStrategy(times) {
        if (times > 5) return 1e4;
        return Math.min(times * 400, 3e3);
      }
    });
    redisClient.on("ready", () => {
      redisReady = true;
      console.info("[RedisCache] Connected to Redis instance");
    });
    redisClient.on("error", (err) => {
      if (redisReady) {
        console.warn("[RedisCache] Redis degraded, falling back to memory:", err.message);
      }
      redisReady = false;
    });
    redisClient.on("end", () => {
      redisReady = false;
    });
    redisClient.connect().catch((err) => {
      console.warn(
        `[RedisCache] Initial Redis connection unavailable (${err.message}); serving from in-memory L1 cache.`
      );
      redisReady = false;
    });
  } catch (err) {
    console.warn("[RedisCache] Failed to initialize ioredis client:", err);
    redisClient = null;
    redisReady = false;
  }
}
function purgeExpiredMemoryEntries() {
  if (memoryStore.size < 2e3) return;
  const now = Date.now();
  for (const [k, entry] of memoryStore.entries()) {
    if (entry.expiresAt <= now) {
      memoryStore.delete(k);
    }
  }
}
function getCacheBackendStatus() {
  return {
    backend: redisClient && redisReady ? "redis" : "memory-l1",
    redisConnected: Boolean(redisClient && redisReady),
    ttlSeconds: CATALOG_CACHE_TTL_SECONDS
  };
}
async function cacheGetJson(key) {
  if (redisClient && redisReady) {
    try {
      const raw = await redisClient.get(key);
      if (raw !== null) {
        return JSON.parse(raw);
      }
      return null;
    } catch {
    }
  }
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  try {
    return JSON.parse(entry.value);
  } catch {
    memoryStore.delete(key);
    return null;
  }
}
async function cacheSetJson(key, payload, ttlSeconds = CATALOG_CACHE_TTL_SECONDS) {
  const serialized = JSON.stringify(payload);
  purgeExpiredMemoryEntries();
  memoryStore.set(key, {
    value: serialized,
    expiresAt: Date.now() + ttlSeconds * 1e3
  });
  if (redisClient && redisReady) {
    try {
      await redisClient.set(key, serialized, "EX", ttlSeconds);
    } catch {
    }
  }
}
async function cacheDeleteKeys(keys) {
  for (const k of keys) {
    memoryStore.delete(k);
  }
  if (redisClient && redisReady && keys.length > 0) {
    try {
      await redisClient.del(...keys);
    } catch {
    }
  }
}
async function claimIdempotencyKey(scope, idempotencyKey, ttlSeconds = 86400) {
  const fullKey = `webshop:idem:${scope}:${idempotencyKey}`;
  const inProgressPayload = JSON.stringify({ status: "IN_PROGRESS", ts: Date.now() });
  if (redisClient && redisReady) {
    try {
      const setRes = await redisClient.set(
        fullKey,
        inProgressPayload,
        "EX",
        ttlSeconds,
        "NX"
      );
      if (setRes === "OK") {
        memoryStore.set(fullKey, {
          value: inProgressPayload,
          expiresAt: Date.now() + ttlSeconds * 1e3
        });
        return { state: "CLAIMED" };
      }
      const existingRaw = await redisClient.get(fullKey);
      if (existingRaw) {
        const parsed = JSON.parse(existingRaw);
        if (parsed.status === "COMPLETED") {
          return { state: "COMPLETED", cachedResponse: parsed.response };
        }
      }
      return { state: "IN_PROGRESS" };
    } catch {
    }
  }
  const now = Date.now();
  const existing = memoryStore.get(fullKey);
  if (existing && existing.expiresAt > now) {
    try {
      const parsed = JSON.parse(existing.value);
      if (parsed.status === "COMPLETED") {
        return { state: "COMPLETED", cachedResponse: parsed.response };
      }
    } catch {
    }
    return { state: "IN_PROGRESS" };
  }
  memoryStore.set(fullKey, {
    value: inProgressPayload,
    expiresAt: now + ttlSeconds * 1e3
  });
  return { state: "CLAIMED" };
}
async function finalizeIdempotencyKey(scope, idempotencyKey, responsePayload, ttlSeconds = 86400) {
  const fullKey = `webshop:idem:${scope}:${idempotencyKey}`;
  const completedPayload = JSON.stringify({
    status: "COMPLETED",
    ts: Date.now(),
    response: responsePayload
  });
  memoryStore.set(fullKey, {
    value: completedPayload,
    expiresAt: Date.now() + ttlSeconds * 1e3
  });
  if (redisClient && redisReady) {
    try {
      await redisClient.set(fullKey, completedPayload, "EX", ttlSeconds);
    } catch {
    }
  }
}
async function releaseIdempotencyKey(scope, idempotencyKey) {
  const fullKey = `webshop:idem:${scope}:${idempotencyKey}`;
  memoryStore.delete(fullKey);
  if (redisClient && redisReady) {
    try {
      await redisClient.del(fullKey);
    } catch {
    }
  }
}
async function incrementRateWindow(bucketKey, windowMs) {
  const windowSec = Math.max(1, Math.ceil(windowMs / 1e3));
  const fullKey = `webshop:rl:${bucketKey}`;
  if (redisClient && redisReady) {
    try {
      const multi = redisClient.multi();
      multi.incr(fullKey);
      multi.pttl(fullKey);
      const results = await multi.exec();
      const count = Number(results?.[0]?.[1] ?? 1);
      let pttl = Number(results?.[1]?.[1] ?? -1);
      if (count === 1 || pttl < 0) {
        await redisClient.pexpire(fullKey, windowMs);
        pttl = windowMs;
      }
      return { count, resetAtMs: Date.now() + pttl };
    } catch {
    }
  }
  const now = Date.now();
  const existing = memoryStore.get(fullKey);
  if (!existing || now >= existing.expiresAt) {
    const expiresAt = now + windowSec * 1e3;
    memoryStore.set(fullKey, { value: "1", expiresAt });
    return { count: 1, resetAtMs: expiresAt };
  }
  const nextCount = (Number(existing.value) || 0) + 1;
  existing.value = String(nextCount);
  return { count: nextCount, resetAtMs: existing.expiresAt };
}
async function closeRedisConnection() {
  if (redisClient) {
    try {
      await redisClient.quit();
    } catch {
      redisClient.disconnect();
    }
  }
}

// src/server/dbRepository.ts
var { Pool } = pg;
var TransactionDomainError = class extends Error {
  constructor(code, httpStatus, message) {
    super(message);
    this.name = "TransactionDomainError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
};
var CATALOG_CACHE_KEY = "webshop:v1:catalog_bundle";
var CATALOG_ITEMS_CACHE_KEY = "webshop:v1:catalog_items";
var CATALOG_CATEGORIES_CACHE_KEY = "webshop:v1:catalog_categories";
var CATALOG_PRICING_CACHE_KEY = "webshop:v1:catalog_pricing";
function hashSimulatedBcrypt(password) {
  const digest = crypto4.createHash("sha256").update(`openmu_salt_${password}`).digest("base64").replace(/[^a-zA-Z0-9./]/g, "A").slice(0, 53);
  return `$2a$11$${digest}`;
}
function verifyAccountPassword(storedPlainOrHash, storedHash, candidatePassword) {
  const candidateHash = hashSimulatedBcrypt(candidatePassword);
  const a = Buffer.from(storedHash);
  const b = Buffer.from(candidateHash);
  if (a.length === b.length && crypto4.timingSafeEqual(a, b)) {
    return true;
  }
  const pA = Buffer.from(storedPlainOrHash);
  const pB = Buffer.from(candidatePassword);
  return pA.length === pB.length && crypto4.timingSafeEqual(pA, pB);
}
var memoryAccounts = /* @__PURE__ */ new Map();
var memoryCharacters = /* @__PURE__ */ new Map();
var memoryMembStat = /* @__PURE__ */ new Map();
var memoryGrantsByIdempotency = /* @__PURE__ */ new Map();
var memoryGrantsByReference = /* @__PURE__ */ new Map();
var memoryGrantsList = [];
var memoryCreditExchanges = /* @__PURE__ */ new Map();
var memoryAuthoritativeItemOrders = /* @__PURE__ */ new Map();
var serverCatalog = structuredClone(INITIAL_WEBSHOP_ITEMS);
var serverGroups = structuredClone(INITIAL_GROUPS);
var serverConfig = structuredClone(DEFAULT_WEBSHOP_CONFIG);
var catalogVersion = 1;
var memoryPromotionConfig = buildDefaultPromotionConfig();
function seedMemoryStore() {
  const envAdmin = (process.env.ADMIN_USERNAME || "admin").trim();
  const envPass = process.env.ADMIN_PASSWORD || "admin";
  const envDeleteCode = /^\d{4,8}$/.test(process.env.ADMIN_DELETE_CODE || "") ? String(process.env.ADMIN_DELETE_CODE) : "123456";
  const initialAccounts = [
    {
      loginName: envAdmin,
      password: envPass,
      securityCode: envDeleteCode,
      state: "GameMaster",
      role: "SUPER_ADMIN",
      isMasterAdmin: true,
      credits: 1e5,
      wCoinC: 1e4,
      vaultMoney: 5e8,
      onlineMinutes: 360,
      exchangedOnlineHours: 4
    },
    {
      loginName: "user01",
      password: "123456",
      securityCode: "123456",
      state: "Normal",
      role: "USER",
      isMasterAdmin: false,
      credits: 5e4,
      wCoinC: 5e3,
      vaultMoney: 1e8,
      onlineMinutes: 240,
      exchangedOnlineHours: 2
    },
    {
      loginName: "admin01",
      password: "123456",
      securityCode: "123456",
      state: "GameMaster",
      role: "ADMIN",
      isMasterAdmin: false,
      credits: 5e4,
      wCoinC: 5e3,
      vaultMoney: 1e8,
      onlineMinutes: 300,
      exchangedOnlineHours: 3
    }
  ];
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  for (const acc of initialAccounts) {
    const key = acc.loginName.toLowerCase();
    memoryAccounts.set(key, {
      id: crypto4.randomUUID(),
      loginName: acc.loginName,
      passwordPlainOrSimulatedBcrypt: acc.password,
      passwordHash: hashSimulatedBcrypt(acc.password),
      securityCode: acc.securityCode,
      email: `${acc.loginName}@egis-mu.com`,
      state: acc.state,
      role: acc.role,
      isMasterAdmin: acc.isMasterAdmin,
      registrationDate: nowIso,
      credits: acc.credits,
      vaultMoney: acc.vaultMoney,
      onlineMinutes: acc.onlineMinutes,
      exchangedOnlineHours: acc.exchangedOnlineHours,
      wCoinC: acc.wCoinC,
      wCoinP: 0,
      goblinPoints: 0,
      vipUntil: null,
      vaultItems: []
    });
    memoryMembStat.set(key, {
      memb___id: acc.loginName,
      ConnectStat: 0,
      ServerName: "Continent-of-Egis-MU-1",
      IP: "127.0.0.1",
      ConnectTM: null,
      DisConnectTM: nowIso
    });
  }
  const seedChars = [
    { name: "BladeKing", accountId: envAdmin, classCode: "bm", level: 400 },
    { name: "SoulLord", accountId: envAdmin, classCode: "gm", level: 400 },
    { name: "DarkKnight", accountId: "user01", classCode: "bm", level: 400 },
    { name: "HighElf400", accountId: "user01", classCode: "he", level: 400 },
    { name: "OriginGM", accountId: "admin01", classCode: "le", level: 400 }
  ];
  for (const sc of seedChars) {
    const calc = calculateClassStatPoints(sc.classCode, sc.level);
    memoryCharacters.set(sc.name.toLowerCase(), {
      name: sc.name,
      accountId: sc.accountId,
      classCode: calc.classDef.code,
      classId: calc.classDef.id,
      level: sc.level,
      resets: 0,
      levelUpPoints: calc.totalPoints,
      strength: calc.classDef.baseStr,
      agility: calc.classDef.baseAgi,
      vitality: calc.classDef.baseVit,
      energy: calc.classDef.baseEne,
      command: calc.classDef.baseCmd,
      money: 5e7,
      ctlCode: 0,
      isOnline: false
    });
  }
}
var DB_URL = (process.env.OPENMU_DATABASE_URL || process.env.DATABASE_URL || "").trim();
var pgPool = null;
var pgHealthy = false;
async function initializeDatabaseLayer() {
  if (!DB_URL) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("OPENMU_DATABASE_URL is required. Embedded account and payment storage is disabled.");
    }
    console.warn("[Database] No OPENMU_DATABASE_URL configured. Initializing embedded ACID memory storage for development.");
    seedMemoryStore();
    return;
  }
  try {
    pgPool = new Pool({
      connectionString: DB_URL,
      max: Number(process.env.DB_POOL_MAX) || 20,
      idleTimeoutMillis: 3e4,
      connectionTimeoutMillis: 3500,
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" } : void 0
    });
    pgPool.on("error", (err) => {
      console.error("[Database] Unexpected idle PostgreSQL client error:", err.message);
      pgHealthy = false;
    });
    const client = await pgPool.connect();
    try {
      await bootstrapPostgresSchema(client);
      const mappings = await client.query("SELECT item_uid, package_sequence, price_sequence, item_json FROM webshop_catalog_openmu_mappings");
      for (const mapping of mappings.rows) {
        const persisted = mapping.item_json;
        const item = persisted ?? serverCatalog.find((candidate) => candidate.uid === mapping.item_uid);
        if (!item) continue;
        if (mapping.package_sequence === null) {
          delete item.openMuPackageSequence;
          delete item.openMuPriceSequence;
        } else {
          item.openMuPackageSequence = mapping.package_sequence;
          item.openMuPriceSequence = mapping.price_sequence;
        }
        const index = serverCatalog.findIndex((candidate) => candidate.uid === mapping.item_uid);
        if (index >= 0) {
          serverCatalog[index] = item;
        } else {
          serverCatalog.push(item);
        }
      }
      pgHealthy = true;
      console.info("[Database] PostgreSQL connected & ACID schema verified.");
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(`[Database] PostgreSQL unavailable (${err instanceof Error ? err.message : err}).`);
    pgHealthy = false;
    if (process.env.NODE_ENV === "production") {
      throw err;
    }
    console.warn("[Database] Falling back to embedded ACID memory storage for development.");
    seedMemoryStore();
  }
}
async function bootstrapPostgresSchema(client) {
  await client.query(`
    CREATE SEQUENCE IF NOT EXISTS webshop_item_serial_seq START WITH 1048576 INCREMENT BY 1;

    CREATE TABLE IF NOT EXISTS "MEMB_STAT" (
      "memb___id" VARCHAR(20) PRIMARY KEY,
      "ConnectStat" SMALLINT NOT NULL DEFAULT 0 CHECK ("ConnectStat" IN (0, 1)),
      "ServerName" VARCHAR(50) NOT NULL DEFAULT 'Continent-of-Egis-MU-1',
      "IP" VARCHAR(64) NOT NULL DEFAULT '0.0.0.0',
      "ConnectTM" TIMESTAMPTZ,
      "DisConnectTM" TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS webshop_accounts (
      id UUID PRIMARY KEY,
      login_name VARCHAR(20) UNIQUE NOT NULL,
      password_hash VARCHAR(128) NOT NULL,
      security_code VARCHAR(16) NOT NULL DEFAULT '0000000',
      email VARCHAR(128) NOT NULL,
      state VARCHAR(32) NOT NULL DEFAULT 'Normal',
      role VARCHAR(20) NOT NULL DEFAULT 'USER',
      is_master_admin BOOLEAN NOT NULL DEFAULT FALSE,
      credits INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0),
      vault_money BIGINT NOT NULL DEFAULT 0 CHECK (vault_money >= 0),
      online_minutes INTEGER NOT NULL DEFAULT 0 CHECK (online_minutes >= 0),
      exchanged_online_hours INTEGER NOT NULL DEFAULT 0 CHECK (exchanged_online_hours >= 0),
      wcoinc INTEGER NOT NULL DEFAULT 0 CHECK (wcoinc >= 0),
      wcoinp INTEGER NOT NULL DEFAULT 0 CHECK (wcoinp >= 0),
      goblin_points INTEGER NOT NULL DEFAULT 0 CHECK (goblin_points >= 0),
      vip_until TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE webshop_accounts
      ADD COLUMN IF NOT EXISTS security_code VARCHAR(16) NOT NULL DEFAULT '0000000';
    ALTER TABLE webshop_accounts
      ADD COLUMN IF NOT EXISTS online_minutes INTEGER NOT NULL DEFAULT 0 CHECK (online_minutes >= 0);
    ALTER TABLE webshop_accounts
      ADD COLUMN IF NOT EXISTS exchanged_online_hours INTEGER NOT NULL DEFAULT 0 CHECK (exchanged_online_hours >= 0);

    CREATE TABLE IF NOT EXISTS webshop_characters (
      name VARCHAR(20) PRIMARY KEY,
      account_login VARCHAR(20) NOT NULL,
      class_code VARCHAR(16) NOT NULL DEFAULT 'bm',
      class_id SMALLINT NOT NULL DEFAULT 18,
      level SMALLINT NOT NULL DEFAULT 400,
      resets INTEGER NOT NULL DEFAULT 0,
      level_up_points INTEGER NOT NULL DEFAULT 0,
      strength INTEGER NOT NULL DEFAULT 28,
      agility INTEGER NOT NULL DEFAULT 20,
      vitality INTEGER NOT NULL DEFAULT 25,
      energy INTEGER NOT NULL DEFAULT 10,
      command INTEGER NOT NULL DEFAULT 0,
      money BIGINT NOT NULL DEFAULT 0,
      ctl_code SMALLINT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS webshop_warehouse_items (
      instance_id VARCHAR(64) PRIMARY KEY,
      account_login VARCHAR(20) NOT NULL REFERENCES webshop_accounts(login_name) ON DELETE CASCADE,
      slot_index SMALLINT NOT NULL CHECK (slot_index >= 0 AND slot_index < 120),
      serial CHAR(8) UNIQUE NOT NULL,
      item_hex CHAR(32) NOT NULL,
      item_uid INTEGER NOT NULL,
      item_id SMALLINT NOT NULL,
      item_type SMALLINT NOT NULL,
      name VARCHAR(120) NOT NULL,
      width SMALLINT NOT NULL CHECK (width BETWEEN 1 AND 8),
      height SMALLINT NOT NULL CHECK (height BETWEEN 1 AND 15),
      item_level SMALLINT NOT NULL DEFAULT 0,
      item_option SMALLINT NOT NULL DEFAULT 0,
      luck BOOLEAN NOT NULL DEFAULT FALSE,
      skill BOOLEAN NOT NULL DEFAULT FALSE,
      exl_mask SMALLINT NOT NULL DEFAULT 0,
      ancient_stamina SMALLINT NOT NULL DEFAULT 0,
      fenrir_variant SMALLINT NOT NULL DEFAULT 0,
      durability SMALLINT NOT NULL DEFAULT 255,
      paid_credits INTEGER NOT NULL DEFAULT 0,
      can_sell_back BOOLEAN NOT NULL DEFAULT TRUE,
      purchased_at BIGINT NOT NULL,
      UNIQUE (account_login, slot_index)
    );

    CREATE TABLE IF NOT EXISTS payment_idempotency_keys (
      idempotency_key VARCHAR(128) PRIMARY KEY,
      reference VARCHAR(128) UNIQUE NOT NULL,
      account_login VARCHAR(20) NOT NULL,
      coin_type VARCHAR(20) NOT NULL,
      coin_amount INTEGER NOT NULL,
      credits_added INTEGER NOT NULL,
      reason VARCHAR(255) NOT NULL,
      client_name VARCHAR(64) NOT NULL,
      response_json JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS webshop_credit_exchanges (
      idempotency_key VARCHAR(128) PRIMARY KEY,
      account_login VARCHAR(20) NOT NULL,
      credits_spent INTEGER NOT NULL CHECK (credits_spent > 0),
      wcoinc_granted INTEGER NOT NULL CHECK (wcoinc_granted > 0),
      status VARCHAR(16) NOT NULL CHECK (status IN ('pending', 'completed')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS webshop_item_orders (
      reference VARCHAR(128) PRIMARY KEY,
      account_login VARCHAR(20) NOT NULL,
      item_uid INTEGER NOT NULL,
      package_sequence INTEGER NOT NULL,
      price_sequence INTEGER,
      charged_credits INTEGER NOT NULL CHECK (charged_credits > 0),
      status VARCHAR(16) NOT NULL CHECK (status IN ('pending', 'delivered', 'rejected', 'manual_review')),
      openmu_grant_id UUID,
      failure_code VARCHAR(64),
      response_json JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_webshop_item_orders_account_created
      ON webshop_item_orders (LOWER(account_login), created_at DESC);

    CREATE TABLE IF NOT EXISTS webshop_catalog_openmu_mappings (
      item_uid INTEGER PRIMARY KEY,
      package_sequence INTEGER CHECK (package_sequence >= 0),
      price_sequence INTEGER,
      item_json JSONB,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE webshop_catalog_openmu_mappings
      ADD COLUMN IF NOT EXISTS item_json JSONB;
    ALTER TABLE webshop_catalog_openmu_mappings
      ALTER COLUMN package_sequence DROP NOT NULL;

    CREATE TABLE IF NOT EXISTS webshop_audit_logs (
      id UUID PRIMARY KEY,
      account_id VARCHAR(32) NOT NULL,
      ip_address VARCHAR(64) NOT NULL,
      action VARCHAR(64) NOT NULL,
      status VARCHAR(24) NOT NULL,
      item_hex VARCHAR(512),
      item_serial VARCHAR(16),
      credits_delta INTEGER NOT NULL DEFAULT 0,
      wcoinc_delta INTEGER NOT NULL DEFAULT 0,
      idempotency_key VARCHAR(128),
      details TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_audit_logs_account_created
      ON webshop_audit_logs (LOWER(account_id), created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_serial
      ON webshop_audit_logs (item_serial) WHERE item_serial IS NOT NULL;

    CREATE TABLE IF NOT EXISTS webshop_promotions_config (
      id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      config_json JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  const defaultPromo = buildDefaultPromotionConfig();
  await client.query(
    `INSERT INTO webshop_promotions_config (id, config_json, updated_at)
     VALUES (1, $1::jsonb, NOW())
     ON CONFLICT (id) DO NOTHING`,
    [JSON.stringify(defaultPromo)]
  );
  const promoRes = await client.query(
    `SELECT config_json FROM webshop_promotions_config WHERE id = 1 LIMIT 1`
  );
  if (promoRes.rows[0]?.config_json) {
    memoryPromotionConfig = sanitizePromotionConfig(promoRes.rows[0].config_json);
  }
}
function getDatabaseHealth() {
  return {
    mode: pgPool && pgHealthy ? "postgresql-acid" : "embedded-acid",
    postgresConnected: Boolean(pgPool && pgHealthy)
  };
}
function getPgPool() {
  return pgPool && pgHealthy ? pgPool : null;
}
function getConfiguredAdminUsernames() {
  const configured = (process.env.ADMIN_ACCOUNTS ?? "").split(",").map((v) => v.trim().toLowerCase()).filter(Boolean);
  const envAdmin = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
  if (envAdmin) configured.push(envAdmin);
  configured.push("admin01");
  return new Set(configured);
}
async function authenticateOpenMuAccount(loginName, password) {
  const adminAccounts = getConfiguredAdminUsernames();
  if (!pgPool || !pgHealthy) {
    const mem = memoryAccounts.get(loginName.trim().toLowerCase());
    if (!mem) return null;
    const ok = verifyAccountPassword(mem.passwordHash, mem.passwordPlainOrSimulatedBcrypt, password);
    if (!ok) return null;
    const isAdmin2 = Boolean(
      mem.isMasterAdmin || mem.role === "ADMIN" || mem.role === "SUPER_ADMIN" || mem.state === "GameMaster" || adminAccounts.has(mem.loginName.toLowerCase())
    );
    return {
      id: mem.id,
      loginName: mem.loginName,
      email: mem.email,
      state: mem.state === "Normal" || mem.state === "GameMaster" ? 0 : 1,
      credits: mem.credits,
      vaultMoney: mem.vaultMoney,
      onlineMinutes: mem.onlineMinutes,
      exchangedOnlineHours: mem.exchangedOnlineHours,
      vipUntil: mem.vipUntil,
      isAdmin: isAdmin2,
      role: isAdmin2 ? mem.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN" : "USER",
      wCoinC: mem.wCoinC,
      wCoinP: mem.wCoinP,
      goblinPoints: mem.goblinPoints
    };
  }
  const result = await pgPool.query(
    `SELECT "Id", "LoginName", "PasswordHash", COALESCE("SecurityCode", '') AS "SecurityCode", "EMail", "State", "WCoinC", "WCoinP", "GoblinPoints"
       FROM data."Account"
      WHERE LOWER("LoginName") = LOWER($1)
      LIMIT 1`,
    [loginName]
  );
  const account = result.rows[0];
  if (!account || !await bcrypt.compare(password, account.PasswordHash)) {
    return null;
  }
  const isConfiguredAdmin = adminAccounts.has(account.LoginName.toLowerCase()) || account.State === 2;
  await pgPool.query(
    `INSERT INTO webshop_accounts (
       id, login_name, password_hash, security_code, email, state, role, is_master_admin,
       credits, vault_money, wcoinc, wcoinp, goblin_points
     ) VALUES ($1, $2, '', $3, $4, $5, $6, $7, 0, 0, $8, $9, $10)
     ON CONFLICT (login_name) DO UPDATE SET
       security_code = CASE WHEN EXCLUDED.security_code <> '' THEN EXCLUDED.security_code ELSE webshop_accounts.security_code END,
       email = EXCLUDED.email,
       state = EXCLUDED.state,
       role = CASE WHEN webshop_accounts.role IN ('ADMIN', 'SUPER_ADMIN') THEN webshop_accounts.role ELSE EXCLUDED.role END,
       is_master_admin = webshop_accounts.is_master_admin OR EXCLUDED.is_master_admin,
       wcoinc = EXCLUDED.wcoinc,
       wcoinp = EXCLUDED.wcoinp,
       goblin_points = EXCLUDED.goblin_points,
       updated_at = NOW()`,
    [
      account.Id,
      account.LoginName,
      account.SecurityCode || "",
      account.EMail,
      String(account.State),
      isConfiguredAdmin ? "ADMIN" : "USER",
      isConfiguredAdmin,
      account.WCoinC,
      account.WCoinP,
      account.GoblinPoints
    ]
  );
  const wallet = await pgPool.query(
    `SELECT credits, vault_money, online_minutes, exchanged_online_hours, vip_until, role, is_master_admin
       FROM webshop_accounts
      WHERE LOWER(login_name) = LOWER($1)
      LIMIT 1`,
    [account.LoginName]
  );
  const wRow = wallet.rows[0];
  const isAdmin = Boolean(
    isConfiguredAdmin || wRow?.is_master_admin || wRow?.role === "ADMIN" || wRow?.role === "SUPER_ADMIN"
  );
  return {
    id: account.Id,
    loginName: account.LoginName,
    email: account.EMail,
    state: account.State === 2 ? 0 : account.State,
    credits: wRow?.credits ?? 0,
    vaultMoney: Number(wRow?.vault_money ?? 0),
    onlineMinutes: Number(wRow?.online_minutes ?? 0),
    exchangedOnlineHours: Number(wRow?.exchanged_online_hours ?? 0),
    vipUntil: wRow?.vip_until ? new Date(wRow.vip_until).toISOString() : null,
    isAdmin,
    role: isAdmin ? "ADMIN" : "USER",
    wCoinC: account.WCoinC,
    wCoinP: account.WCoinP,
    goblinPoints: account.GoblinPoints
  };
}
async function getOpenMuAccountSummary(loginName) {
  const adminAccounts = getConfiguredAdminUsernames();
  if (!pgPool || !pgHealthy) {
    const mem = memoryAccounts.get(loginName.trim().toLowerCase());
    if (!mem) return null;
    const isAdmin2 = Boolean(
      mem.isMasterAdmin || mem.role === "ADMIN" || mem.role === "SUPER_ADMIN" || mem.state === "GameMaster" || adminAccounts.has(mem.loginName.toLowerCase())
    );
    return {
      id: mem.id,
      loginName: mem.loginName,
      email: mem.email,
      state: mem.state === "Normal" || mem.state === "GameMaster" ? 0 : 1,
      credits: mem.credits,
      vaultMoney: mem.vaultMoney,
      onlineMinutes: mem.onlineMinutes,
      exchangedOnlineHours: mem.exchangedOnlineHours,
      vipUntil: mem.vipUntil,
      isAdmin: isAdmin2,
      role: isAdmin2 ? mem.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN" : "USER",
      wCoinC: mem.wCoinC,
      wCoinP: mem.wCoinP,
      goblinPoints: mem.goblinPoints
    };
  }
  const result = await pgPool.query(
    `SELECT a."Id", a."LoginName", a."EMail", a."State", a."WCoinC", a."WCoinP", a."GoblinPoints",
            COALESCE(w.credits, 0)::int AS credits,
            COALESCE(w.vault_money, 0)::bigint AS vault_money,
            COALESCE(w.online_minutes, 0)::int AS online_minutes,
            COALESCE(w.exchanged_online_hours, 0)::int AS exchanged_online_hours,
            w.vip_until,
            w.role,
            w.is_master_admin
       FROM data."Account" a
       LEFT JOIN webshop_accounts w ON LOWER(w.login_name) = LOWER(a."LoginName")
      WHERE LOWER(a."LoginName") = LOWER($1) LIMIT 1`,
    [loginName]
  );
  const account = result.rows[0];
  if (!account) return null;
  const isAdmin = Boolean(
    adminAccounts.has(account.LoginName.toLowerCase()) || account.State === 2 || account.is_master_admin || account.role === "ADMIN" || account.role === "SUPER_ADMIN"
  );
  return {
    id: account.Id,
    loginName: account.LoginName,
    email: account.EMail,
    state: account.State === 2 ? 0 : account.State,
    credits: account.credits,
    vaultMoney: Number(account.vault_money ?? 0),
    onlineMinutes: Number(account.online_minutes ?? 0),
    exchangedOnlineHours: Number(account.exchanged_online_hours ?? 0),
    vipUntil: account.vip_until ? new Date(account.vip_until).toISOString() : null,
    isAdmin,
    role: isAdmin ? "ADMIN" : "USER",
    wCoinC: account.WCoinC,
    wCoinP: account.WCoinP,
    goblinPoints: account.GoblinPoints
  };
}
async function listAdminAccounts(limit = 250) {
  const adminAccounts = getConfiguredAdminUsernames();
  if (!pgPool || !pgHealthy) {
    return Array.from(memoryAccounts.values()).slice(0, limit).map((acc) => {
      const isAdmin = Boolean(
        acc.isMasterAdmin || acc.role === "ADMIN" || acc.role === "SUPER_ADMIN" || acc.state === "GameMaster" || adminAccounts.has(acc.loginName.toLowerCase())
      );
      const stat = memoryMembStat.get(acc.loginName.toLowerCase());
      return {
        username: acc.loginName,
        credits: acc.credits,
        vaultMoney: acc.vaultMoney,
        wCoinC: acc.wCoinC,
        vipUntil: acc.vipUntil,
        isAdmin,
        role: isAdmin ? "ADMIN" : "USER",
        isOnline: stat?.ConnectStat === 1
      };
    });
  }
  try {
    const res = await pgPool.query(
      `SELECT COALESCE(a."LoginName", w.login_name) AS login_name,
              COALESCE(w.credits, 0)::int AS credits,
              COALESCE(w.vault_money, 0)::bigint AS vault_money,
              COALESCE(a."WCoinC", w.wcoinc, 0)::int AS wcoinc,
              w.vip_until,
              w.role,
              w.is_master_admin,
              a."State" AS state
         FROM data."Account" a
         FULL OUTER JOIN webshop_accounts w ON LOWER(w.login_name) = LOWER(a."LoginName")
        ORDER BY COALESCE(w.credits, 0) DESC, COALESCE(a."LoginName", w.login_name) ASC
        LIMIT $1`,
      [limit]
    );
    return res.rows.filter((r) => Boolean(r.login_name)).map((r) => {
      const isAdmin = Boolean(
        adminAccounts.has(r.login_name.toLowerCase()) || r.state === 2 || r.state === "GameMaster" || r.is_master_admin || r.role === "ADMIN" || r.role === "SUPER_ADMIN"
      );
      return {
        username: r.login_name,
        credits: Number(r.credits || 0),
        vaultMoney: Number(r.vault_money || 0),
        wCoinC: Number(r.wcoinc || 0),
        vipUntil: r.vip_until ? new Date(r.vip_until).toISOString() : null,
        isAdmin,
        role: isAdmin ? "ADMIN" : "USER",
        isOnline: false
      };
    });
  } catch {
    const res = await pgPool.query(
      `SELECT login_name, credits, vault_money, wcoinc, vip_until, role, is_master_admin
         FROM webshop_accounts
        ORDER BY credits DESC, login_name ASC
        LIMIT $1`,
      [limit]
    );
    return res.rows.map((r) => {
      const isAdmin = Boolean(
        adminAccounts.has(r.login_name.toLowerCase()) || r.is_master_admin || r.role === "ADMIN" || r.role === "SUPER_ADMIN"
      );
      return {
        username: r.login_name,
        credits: Number(r.credits || 0),
        vaultMoney: Number(r.vault_money || 0),
        wCoinC: Number(r.wcoinc || 0),
        vipUntil: r.vip_until ? new Date(r.vip_until).toISOString() : null,
        isAdmin,
        role: isAdmin ? "ADMIN" : "USER",
        isOnline: false
      };
    });
  }
}
async function adminAdjustAccountBalance(params) {
  const cleanTarget = (params.targetLoginName || "").trim();
  if (!cleanTarget || !/^[a-zA-Z0-9_-]{3,20}$/.test(cleanTarget)) {
    throw new TransactionDomainError(
      "INVALID_ACCOUNT",
      400,
      "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E0A\u0E37\u0E48\u0E2D\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E1C\u0E39\u0E49\u0E40\u0E25\u0E48\u0E19\u0E17\u0E35\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 (3\u201320 \u0E15\u0E31\u0E27\u0E2D\u0E31\u0E01\u0E29\u0E23)"
    );
  }
  const creditsDelta = typeof params.creditsDelta === "number" && Number.isFinite(params.creditsDelta) ? Math.trunc(params.creditsDelta) : 0;
  const vaultZenDelta = typeof params.vaultZenDelta === "number" && Number.isFinite(params.vaultZenDelta) ? Math.trunc(params.vaultZenDelta) : 0;
  if (creditsDelta === 0 && vaultZenDelta === 0) {
    throw new TransactionDomainError(
      "INVALID_DELTA",
      400,
      "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E08\u0E33\u0E19\u0E27\u0E19\u0E40\u0E04\u0E23\u0E14\u0E34\u0E15\u0E2B\u0E23\u0E37\u0E2D\u0E08\u0E33\u0E19\u0E27\u0E19\u0E40\u0E07\u0E34\u0E19 Zen \u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E31\u0E1A (\u0E15\u0E49\u0E2D\u0E07\u0E44\u0E21\u0E48\u0E40\u0E1B\u0E47\u0E19 0)"
    );
  }
  const MAX_VAULT_ZEN = 9e8;
  const adminAccounts = getConfiguredAdminUsernames();
  if (!pgPool || !pgHealthy) {
    return await withAccountMutex(cleanTarget, async () => {
      const key = cleanTarget.toLowerCase();
      let mem = memoryAccounts.get(key);
      if (!mem) {
        const isAdmin2 = adminAccounts.has(key);
        mem = {
          id: crypto4.randomUUID(),
          loginName: cleanTarget,
          passwordPlainOrSimulatedBcrypt: "123456",
          passwordHash: hashSimulatedBcrypt("123456"),
          securityCode: "0000000",
          email: `${cleanTarget}@muorigins.online`,
          state: isAdmin2 ? "GameMaster" : "Normal",
          role: isAdmin2 ? "ADMIN" : "USER",
          isMasterAdmin: isAdmin2,
          registrationDate: (/* @__PURE__ */ new Date()).toISOString(),
          credits: 0,
          vaultMoney: 0,
          onlineMinutes: 0,
          exchangedOnlineHours: 0,
          wCoinC: 0,
          wCoinP: 0,
          goblinPoints: 0,
          vipUntil: null,
          vaultItems: []
        };
        memoryAccounts.set(key, mem);
      }
      if (creditsDelta !== 0) {
        mem.credits = Math.max(0, mem.credits + creditsDelta);
      }
      if (vaultZenDelta !== 0) {
        mem.vaultMoney = Math.min(MAX_VAULT_ZEN, Math.max(0, mem.vaultMoney + vaultZenDelta));
      }
      await recordAuditLog({
        accountId: mem.loginName,
        ipAddress: params.ipAddress,
        action: creditsDelta !== 0 ? "ADMIN_ADJUST_CREDITS" : "ADMIN_ADJUST_VAULT_ZEN",
        status: "COMMITTED",
        creditsDelta,
        details: creditsDelta !== 0 ? `Admin "${params.adminLoginName}" adjusted ${mem.loginName}'s credits by ${creditsDelta >= 0 ? `+${creditsDelta.toLocaleString()}` : creditsDelta.toLocaleString()} (Total: ${mem.credits.toLocaleString()} Cr)` : `Admin "${params.adminLoginName}" adjusted ${mem.loginName}'s Vault Zen by ${vaultZenDelta >= 0 ? `+${vaultZenDelta.toLocaleString()}` : vaultZenDelta.toLocaleString()} (Total: ${mem.vaultMoney.toLocaleString()} Zen)`
      });
      const isAdmin = Boolean(
        mem.isMasterAdmin || mem.role === "ADMIN" || mem.role === "SUPER_ADMIN" || mem.state === "GameMaster" || adminAccounts.has(key)
      );
      return {
        username: mem.loginName,
        credits: mem.credits,
        vaultMoney: mem.vaultMoney,
        wCoinC: mem.wCoinC,
        vipUntil: mem.vipUntil,
        isAdmin,
        role: isAdmin ? "ADMIN" : "USER",
        isOnline: memoryMembStat.get(key)?.ConnectStat === 1
      };
    });
  }
  const client = await pgPool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SAVEPOINT sp_openmu_lookup");
    try {
      const openMuRes = await client.query(
        `SELECT "Id", "LoginName", "EMail", "State", "WCoinC", "WCoinP", "GoblinPoints"
           FROM data."Account"
          WHERE LOWER("LoginName") = LOWER($1)
          LIMIT 1`,
        [cleanTarget]
      );
      const oa = openMuRes.rows[0];
      if (oa) {
        const isCfgAdmin = adminAccounts.has(oa.LoginName.toLowerCase()) || oa.State === 2;
        await client.query(
          `INSERT INTO webshop_accounts (
             id, login_name, password_hash, security_code, email, state, role, is_master_admin,
             credits, vault_money, wcoinc, wcoinp, goblin_points
           ) VALUES ($1, $2, '', '', $3, $4, $5, $6, 0, 0, $7, $8, $9)
           ON CONFLICT (login_name) DO NOTHING`,
          [
            oa.Id,
            oa.LoginName,
            oa.EMail || `${oa.LoginName}@muorigins.online`,
            String(oa.State),
            isCfgAdmin ? "ADMIN" : "USER",
            isCfgAdmin,
            oa.WCoinC || 0,
            oa.WCoinP || 0,
            oa.GoblinPoints || 0
          ]
        );
      }
      await client.query("RELEASE SAVEPOINT sp_openmu_lookup");
    } catch {
      await client.query("ROLLBACK TO SAVEPOINT sp_openmu_lookup");
    }
    const lockRes = await client.query(
      `SELECT login_name, credits, vault_money, wcoinc, vip_until, role, is_master_admin
         FROM webshop_accounts
        WHERE LOWER(login_name) = LOWER($1)
        FOR UPDATE`,
      [cleanTarget]
    );
    const existing = lockRes.rows[0];
    if (!existing) {
      throw new TransactionDomainError(
        "ACCOUNT_NOT_FOUND",
        404,
        `\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E1C\u0E39\u0E49\u0E40\u0E25\u0E48\u0E19 "${cleanTarget}" \u0E43\u0E19\u0E10\u0E32\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 OpenMU`
      );
    }
    const updatedCredits = creditsDelta !== 0 ? Math.max(0, Number(existing.credits || 0) + creditsDelta) : Number(existing.credits || 0);
    const updatedVaultMoney = vaultZenDelta !== 0 ? Math.min(MAX_VAULT_ZEN, Math.max(0, Number(existing.vault_money || 0) + vaultZenDelta)) : Number(existing.vault_money || 0);
    const updRes = await client.query(
      `UPDATE webshop_accounts
          SET credits = $1,
              vault_money = $2,
              updated_at = NOW()
        WHERE login_name = $3
        RETURNING login_name, credits, vault_money, wcoinc, vip_until, role, is_master_admin`,
      [updatedCredits, updatedVaultMoney, existing.login_name]
    );
    if (vaultZenDelta !== 0) {
      await client.query("SAVEPOINT sp_openmu_vault_zen");
      try {
        await client.query(
          `UPDATE data."ItemStorage"
              SET "Money" = $1
            WHERE "Id" = (
              SELECT "VaultId"
                FROM data."Account"
               WHERE LOWER("LoginName") = LOWER($2)
                 AND "VaultId" IS NOT NULL
               LIMIT 1
            )`,
          [updatedVaultMoney, existing.login_name]
        );
        await client.query("RELEASE SAVEPOINT sp_openmu_vault_zen");
      } catch {
        await client.query("ROLLBACK TO SAVEPOINT sp_openmu_vault_zen");
      }
    }
    await recordAuditLog(
      {
        accountId: existing.login_name,
        ipAddress: params.ipAddress,
        action: creditsDelta !== 0 ? "ADMIN_ADJUST_CREDITS" : "ADMIN_ADJUST_VAULT_ZEN",
        status: "COMMITTED",
        creditsDelta,
        details: creditsDelta !== 0 ? `Admin "${params.adminLoginName}" adjusted ${existing.login_name}'s credits by ${creditsDelta >= 0 ? `+${creditsDelta.toLocaleString()}` : creditsDelta.toLocaleString()} (Total: ${updatedCredits.toLocaleString()} Cr)` : `Admin "${params.adminLoginName}" adjusted ${existing.login_name}'s Vault Zen by ${vaultZenDelta >= 0 ? `+${vaultZenDelta.toLocaleString()}` : vaultZenDelta.toLocaleString()} (Total: ${updatedVaultMoney.toLocaleString()} Zen)`
      },
      client
    );
    await client.query("COMMIT");
    const row = updRes.rows[0];
    const isAdmin = Boolean(
      adminAccounts.has(row.login_name.toLowerCase()) || row.is_master_admin || row.role === "ADMIN" || row.role === "SUPER_ADMIN"
    );
    return {
      username: row.login_name,
      credits: Number(row.credits),
      vaultMoney: Number(row.vault_money),
      wCoinC: Number(row.wcoinc),
      vipUntil: row.vip_until ? new Date(row.vip_until).toISOString() : null,
      isAdmin,
      role: isAdmin ? "ADMIN" : "USER",
      isOnline: false
    };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {
    });
    throw err;
  } finally {
    client.release();
  }
}
async function redeemAccountOnlineHours(params) {
  const cleanLogin = (params.loginName || "").trim();
  const hours = Math.trunc(Number(params.hoursToRedeem));
  if (!cleanLogin) {
    throw new TransactionDomainError("UNAUTHORIZED", 401, "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A\u0E01\u0E48\u0E2D\u0E19\u0E17\u0E33\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23");
  }
  if (!Number.isInteger(hours) || hours < 1 || hours > 1e3) {
    throw new TransactionDomainError(
      "INVALID_HOURS",
      400,
      "\u0E08\u0E33\u0E19\u0E27\u0E19\u0E0A\u0E31\u0E48\u0E27\u0E42\u0E21\u0E07\u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E41\u0E25\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E08\u0E33\u0E19\u0E27\u0E19\u0E40\u0E15\u0E47\u0E21\u0E15\u0E31\u0E49\u0E07\u0E41\u0E15\u0E48 1 \u0E0A\u0E31\u0E48\u0E27\u0E42\u0E21\u0E07\u0E02\u0E36\u0E49\u0E19\u0E44\u0E1B"
    );
  }
  const minutesRequired = hours * 60;
  const creditsReward = hours * ONLINE_HOUR_REWARD_CREDITS;
  if (!pgPool || !pgHealthy) {
    return await withAccountMutex(cleanLogin, async () => {
      const mem = memoryAccounts.get(cleanLogin.toLowerCase());
      if (!mem) {
        throw new TransactionDomainError("ACCOUNT_NOT_FOUND", 404, "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E1C\u0E39\u0E49\u0E40\u0E25\u0E48\u0E19\u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A");
      }
      const availableHours = Math.floor((mem.onlineMinutes || 0) / 60);
      if (hours > availableHours || mem.onlineMinutes < minutesRequired) {
        throw new TransactionDomainError(
          "INSUFFICIENT_ONLINE_HOURS",
          400,
          `\u0E40\u0E27\u0E25\u0E32\u0E2D\u0E2D\u0E19\u0E44\u0E25\u0E19\u0E4C\u0E2A\u0E30\u0E2A\u0E21\u0E44\u0E21\u0E48\u0E40\u0E1E\u0E35\u0E22\u0E07\u0E1E\u0E2D (\u0E21\u0E35 ${availableHours} \u0E0A\u0E31\u0E48\u0E27\u0E42\u0E21\u0E07\u0E40\u0E15\u0E47\u0E21 \u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23 ${hours} \u0E0A\u0E31\u0E48\u0E27\u0E42\u0E21\u0E07)`
        );
      }
      mem.onlineMinutes = Math.max(0, mem.onlineMinutes - minutesRequired);
      mem.exchangedOnlineHours = (mem.exchangedOnlineHours || 0) + hours;
      mem.credits += creditsReward;
      await recordAuditLog({
        accountId: mem.loginName,
        ipAddress: params.ipAddress,
        action: "ONLINE_TIME_EXCHANGE",
        status: "COMMITTED",
        creditsDelta: creditsReward,
        details: `Exchanged ${hours} online hour(s) (${minutesRequired} mins) for +${creditsReward} Credits (Remaining: ${mem.onlineMinutes} mins)`
      });
      return {
        ok: true,
        hoursRedeemed: hours,
        creditsAdded: creditsReward,
        credits: mem.credits,
        onlineMinutes: mem.onlineMinutes,
        exchangedOnlineHours: mem.exchangedOnlineHours
      };
    });
  }
  const client = await pgPool.connect();
  try {
    await client.query("BEGIN");
    const lockRes = await client.query(
      `SELECT login_name, credits, online_minutes, exchanged_online_hours
         FROM webshop_accounts
        WHERE LOWER(login_name) = LOWER($1)
        FOR UPDATE`,
      [cleanLogin]
    );
    const acc = lockRes.rows[0];
    if (!acc) {
      throw new TransactionDomainError("ACCOUNT_NOT_FOUND", 404, "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E1C\u0E39\u0E49\u0E40\u0E25\u0E48\u0E19\u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A");
    }
    const availableHours = Math.floor(Number(acc.online_minutes || 0) / 60);
    if (hours > availableHours || Number(acc.online_minutes || 0) < minutesRequired) {
      throw new TransactionDomainError(
        "INSUFFICIENT_ONLINE_HOURS",
        400,
        `\u0E40\u0E27\u0E25\u0E32\u0E2D\u0E2D\u0E19\u0E44\u0E25\u0E19\u0E4C\u0E2A\u0E30\u0E2A\u0E21\u0E44\u0E21\u0E48\u0E40\u0E1E\u0E35\u0E22\u0E07\u0E1E\u0E2D (\u0E21\u0E35 ${availableHours} \u0E0A\u0E31\u0E48\u0E27\u0E42\u0E21\u0E07\u0E40\u0E15\u0E47\u0E21 \u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23 ${hours} \u0E0A\u0E31\u0E48\u0E27\u0E42\u0E21\u0E07)`
      );
    }
    const updRes = await client.query(
      `UPDATE webshop_accounts
          SET online_minutes = online_minutes - $1,
              exchanged_online_hours = exchanged_online_hours + $2,
              credits = credits + $3,
              updated_at = NOW()
        WHERE login_name = $4
          AND online_minutes >= $1
        RETURNING credits, online_minutes, exchanged_online_hours`,
      [minutesRequired, hours, creditsReward, acc.login_name]
    );
    const row = updRes.rows[0];
    if (!row) {
      throw new TransactionDomainError(
        "INSUFFICIENT_ONLINE_HOURS",
        409,
        "\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E41\u0E25\u0E01\u0E40\u0E27\u0E25\u0E32\u0E2D\u0E2D\u0E19\u0E44\u0E25\u0E19\u0E4C\u0E44\u0E14\u0E49 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E25\u0E2D\u0E07\u0E43\u0E2B\u0E21\u0E48\u0E2D\u0E35\u0E01\u0E04\u0E23\u0E31\u0E49\u0E07"
      );
    }
    await recordAuditLog(
      {
        accountId: acc.login_name,
        ipAddress: params.ipAddress,
        action: "ONLINE_TIME_EXCHANGE",
        status: "COMMITTED",
        creditsDelta: creditsReward,
        details: `Exchanged ${hours} online hour(s) (${minutesRequired} mins) for +${creditsReward} Credits`
      },
      client
    );
    await client.query("COMMIT");
    return {
      ok: true,
      hoursRedeemed: hours,
      creditsAdded: creditsReward,
      credits: Number(row.credits),
      onlineMinutes: Number(row.online_minutes),
      exchangedOnlineHours: Number(row.exchanged_online_hours)
    };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {
    });
    throw err;
  } finally {
    client.release();
  }
}
async function getAccountCharacters(loginName) {
  const cleanLogin = (loginName || "").trim();
  if (!cleanLogin) return [];
  if (!pgPool || !pgHealthy) {
    return Array.from(memoryCharacters.values()).filter(
      (c) => c.accountId.toLowerCase() === cleanLogin.toLowerCase()
    );
  }
  const byName = /* @__PURE__ */ new Map();
  try {
    const wsRes = await pgPool.query(
      `SELECT name, account_login, class_code, class_id, level, resets, level_up_points,
              strength, agility, vitality, energy, command, money, ctl_code
         FROM webshop_characters
        WHERE LOWER(account_login) = LOWER($1)
        ORDER BY level DESC, name ASC`,
      [cleanLogin]
    );
    for (const r of wsRes.rows) {
      byName.set(r.name.toLowerCase(), {
        name: r.name,
        accountId: r.account_login,
        classCode: r.class_code || "bm",
        classId: Number(r.class_id || 18),
        level: Number(r.level || 400),
        resets: Number(r.resets || 0),
        levelUpPoints: Number(r.level_up_points || 0),
        strength: Number(r.strength || 28),
        agility: Number(r.agility || 20),
        vitality: Number(r.vitality || 25),
        energy: Number(r.energy || 10),
        command: Number(r.command || 0),
        money: Number(r.money || 0),
        ctlCode: Number(r.ctl_code || 0),
        isOnline: false
      });
    }
  } catch {
  }
  try {
    const omuRes = await pgPool.query(
      `SELECT c."Name",
              a."LoginName",
              COALESCE(c."CharacterStatus", 0)::int AS "CharacterStatus",
              COALESCE(c."LevelUpPoints", 0)::int AS "LevelUpPoints",
              cc."Number" AS "ClassNumber",
              COALESCE(
                (SELECT MAX(sa."Value")::int
                   FROM data."StatAttribute" sa
                   JOIN config."AttributeDefinition" ad ON ad."Id" = sa."DefinitionId"
                  WHERE sa."CharacterId" = c."Id"
                    AND LOWER(ad."Designation") LIKE '%level%'),
                400
              ) AS "Level",
              COALESCE(inv."Money", 0)::bigint AS "Money"
         FROM data."Character" c
         JOIN data."Account" a ON a."Id" = c."AccountId"
         LEFT JOIN config."CharacterClass" cc ON cc."Id" = c."CharacterClassId"
         LEFT JOIN data."ItemStorage" inv ON inv."Id" = c."InventoryId"
        WHERE LOWER(a."LoginName") = LOWER($1)
        ORDER BY c."CharacterSlot" ASC`,
      [cleanLogin]
    );
    for (const r of omuRes.rows) {
      const matchedClass = MU_CLASSES.find((m) => m.id === Number(r.ClassNumber)) || MU_CLASSES[2];
      const level = Math.max(1, Math.min(400, Number(r.Level || 400)));
      const calc = calculateClassStatPoints(matchedClass.code, level);
      byName.set(r.Name.toLowerCase(), {
        name: r.Name,
        accountId: r.LoginName,
        classCode: matchedClass.code,
        classId: matchedClass.id,
        level,
        resets: 0,
        levelUpPoints: Number(r.LevelUpPoints ?? calc.totalPoints),
        strength: calc.classDef.baseStr,
        agility: calc.classDef.baseAgi,
        vitality: calc.classDef.baseVit,
        energy: calc.classDef.baseEne,
        command: calc.classDef.baseCmd,
        money: Number(r.Money || 0),
        ctlCode: Number(r.CharacterStatus || 0),
        isOnline: false
      });
    }
  } catch {
  }
  return Array.from(byName.values());
}
async function buyCharacter400Tx(params) {
  const cleanLogin = (params.loginName || "").trim();
  const cleanCharName = (params.characterName || "").trim();
  if (!cleanLogin) {
    throw new TransactionDomainError("UNAUTHORIZED", 401, "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A\u0E01\u0E48\u0E2D\u0E19\u0E17\u0E33\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23");
  }
  if (!/^[a-zA-Z0-9_-]{2,10}$/.test(cleanCharName)) {
    throw new TransactionDomainError(
      "INVALID_CHAR_NAME",
      400,
      "\u0E0A\u0E37\u0E48\u0E2D\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E20\u0E32\u0E29\u0E32\u0E2D\u0E31\u0E07\u0E01\u0E24\u0E29\u0E2B\u0E23\u0E37\u0E2D\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02 \u0E04\u0E27\u0E32\u0E21\u0E22\u0E32\u0E27 2\u201310 \u0E15\u0E31\u0E27\u0E2D\u0E31\u0E01\u0E29\u0E23"
    );
  }
  const calc = calculateClassStatPoints(params.classCode, 400);
  if (!calc.classDef.s3) {
    throw new TransactionDomainError(
      "INVALID_CLASS",
      400,
      "\u0E2D\u0E19\u0E38\u0E0D\u0E32\u0E15\u0E43\u0E2B\u0E49\u0E0B\u0E37\u0E49\u0E2D\u0E40\u0E09\u0E1E\u0E32\u0E30\u0E2A\u0E32\u0E22\u0E2D\u0E32\u0E0A\u0E35\u0E1E Class 3 \u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19"
    );
  }
  const cost = BUY_CHAR_400_CREDITS;
  if (!pgPool || !pgHealthy) {
    return await withAccountMutex(cleanLogin, async () => {
      const mem = memoryAccounts.get(cleanLogin.toLowerCase());
      if (!mem) {
        throw new TransactionDomainError("ACCOUNT_NOT_FOUND", 404, "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E1C\u0E39\u0E49\u0E40\u0E25\u0E48\u0E19\u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A");
      }
      if (memoryMembStat.get(cleanLogin.toLowerCase())?.ConnectStat === 1) {
        throw new TransactionDomainError(
          "ACCOUNT_ONLINE",
          409,
          "\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E15\u0E49\u0E2D\u0E07\u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E2D\u0E2D\u0E1F\u0E44\u0E25\u0E19\u0E4C (Offline) \u0E01\u0E48\u0E2D\u0E19\u0E0B\u0E37\u0E49\u0E2D\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23\u0E43\u0E2B\u0E21\u0E48"
        );
      }
      const existingChars = Array.from(memoryCharacters.values()).filter(
        (c) => c.accountId.toLowerCase() === cleanLogin.toLowerCase()
      );
      if (existingChars.length >= 5) {
        throw new TransactionDomainError(
          "MAX_CHARACTERS_REACHED",
          400,
          "\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E21\u0E35\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23\u0E04\u0E23\u0E1A\u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14 5 \u0E15\u0E31\u0E27\u0E41\u0E25\u0E49\u0E27"
        );
      }
      if (memoryCharacters.has(cleanCharName.toLowerCase())) {
        throw new TransactionDomainError(
          "CHAR_NAME_TAKEN",
          409,
          `\u0E0A\u0E37\u0E48\u0E2D\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23 "${cleanCharName}" \u0E21\u0E35\u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A\u0E41\u0E25\u0E49\u0E27`
        );
      }
      if (mem.credits < cost) {
        throw new TransactionDomainError(
          "INSUFFICIENT_CREDITS",
          402,
          `\u0E40\u0E04\u0E23\u0E14\u0E34\u0E15\u0E44\u0E21\u0E48\u0E40\u0E1E\u0E35\u0E22\u0E07\u0E1E\u0E2D (\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23 ${cost.toLocaleString()} Credits)`
        );
      }
      const newChar = {
        name: cleanCharName,
        accountId: mem.loginName,
        classCode: calc.classDef.code,
        classId: calc.classDef.id,
        level: 400,
        resets: 0,
        levelUpPoints: calc.totalPoints,
        strength: calc.classDef.baseStr,
        agility: calc.classDef.baseAgi,
        vitality: calc.classDef.baseVit,
        energy: calc.classDef.baseEne,
        command: calc.classDef.baseCmd,
        money: 0,
        ctlCode: 0,
        isOnline: false
      };
      mem.credits -= cost;
      memoryCharacters.set(cleanCharName.toLowerCase(), newChar);
      await recordAuditLog({
        accountId: mem.loginName,
        ipAddress: params.ipAddress,
        action: "BUY_CHARACTER_400",
        status: "COMMITTED",
        creditsDelta: -cost,
        details: `Purchased Lv.400 character "${cleanCharName}" (${calc.classDef.name}) for ${cost} Credits`
      });
      return {
        ok: true,
        character: newChar,
        remainingCredits: mem.credits,
        characters: await getAccountCharacters(mem.loginName)
      };
    });
  }
  const client = await pgPool.connect();
  try {
    await client.query("BEGIN");
    const membRes = await client.query(
      `SELECT "ConnectStat" FROM "MEMB_STAT" WHERE LOWER("memb___id") = LOWER($1) FOR SHARE`,
      [cleanLogin]
    );
    if (membRes.rows[0]?.ConnectStat === 1) {
      throw new TransactionDomainError(
        "ACCOUNT_ONLINE",
        409,
        "\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E15\u0E49\u0E2D\u0E07\u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E2D\u0E2D\u0E1F\u0E44\u0E25\u0E19\u0E4C (Offline) \u0E01\u0E48\u0E2D\u0E19\u0E0B\u0E37\u0E49\u0E2D\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23\u0E43\u0E2B\u0E21\u0E48"
      );
    }
    const lockAcc = await client.query(
      `SELECT login_name, credits FROM webshop_accounts WHERE LOWER(login_name) = LOWER($1) FOR UPDATE`,
      [cleanLogin]
    );
    const acc = lockAcc.rows[0];
    if (!acc) {
      throw new TransactionDomainError("ACCOUNT_NOT_FOUND", 404, "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E1C\u0E39\u0E49\u0E40\u0E25\u0E48\u0E19\u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A");
    }
    if (acc.credits < cost) {
      throw new TransactionDomainError(
        "INSUFFICIENT_CREDITS",
        402,
        `\u0E40\u0E04\u0E23\u0E14\u0E34\u0E15\u0E44\u0E21\u0E48\u0E40\u0E1E\u0E35\u0E22\u0E07\u0E1E\u0E2D (\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23 ${cost.toLocaleString()} Credits)`
      );
    }
    const cntRes = await client.query(
      `SELECT COUNT(*)::text AS cnt FROM webshop_characters WHERE LOWER(account_login) = LOWER($1)`,
      [acc.login_name]
    );
    if (Number(cntRes.rows[0]?.cnt || 0) >= 5) {
      throw new TransactionDomainError(
        "MAX_CHARACTERS_REACHED",
        400,
        "\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E21\u0E35\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23\u0E04\u0E23\u0E1A\u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14 5 \u0E15\u0E31\u0E27\u0E41\u0E25\u0E49\u0E27"
      );
    }
    const dupRes = await client.query(
      `SELECT name FROM webshop_characters WHERE LOWER(name) = LOWER($1) LIMIT 1`,
      [cleanCharName]
    );
    if (dupRes.rows[0]) {
      throw new TransactionDomainError(
        "CHAR_NAME_TAKEN",
        409,
        `\u0E0A\u0E37\u0E48\u0E2D\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23 "${cleanCharName}" \u0E21\u0E35\u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A\u0E41\u0E25\u0E49\u0E27`
      );
    }
    const updAcc = await client.query(
      `UPDATE webshop_accounts SET credits = credits - $1, updated_at = NOW()
        WHERE login_name = $2 AND credits >= $1 RETURNING credits`,
      [cost, acc.login_name]
    );
    await client.query(
      `INSERT INTO webshop_characters (
         name, account_login, class_code, class_id, level, resets, level_up_points,
         strength, agility, vitality, energy, command, money, ctl_code
       ) VALUES ($1, $2, $3, $4, 400, 0, $5, $6, $7, $8, $9, $10, 0, 0)`,
      [
        cleanCharName,
        acc.login_name,
        calc.classDef.code,
        calc.classDef.id,
        calc.totalPoints,
        calc.classDef.baseStr,
        calc.classDef.baseAgi,
        calc.classDef.baseVit,
        calc.classDef.baseEne,
        calc.classDef.baseCmd
      ]
    );
    await recordAuditLog(
      {
        accountId: acc.login_name,
        ipAddress: params.ipAddress,
        action: "BUY_CHARACTER_400",
        status: "COMMITTED",
        creditsDelta: -cost,
        details: `Purchased Lv.400 character "${cleanCharName}" (${calc.classDef.name}) for ${cost} Credits`
      },
      client
    );
    await client.query("COMMIT");
    const newChar = {
      name: cleanCharName,
      accountId: acc.login_name,
      classCode: calc.classDef.code,
      classId: calc.classDef.id,
      level: 400,
      resets: 0,
      levelUpPoints: calc.totalPoints,
      strength: calc.classDef.baseStr,
      agility: calc.classDef.baseAgi,
      vitality: calc.classDef.baseVit,
      energy: calc.classDef.baseEne,
      command: calc.classDef.baseCmd,
      money: 0,
      ctlCode: 0,
      isOnline: false
    };
    return {
      ok: true,
      character: newChar,
      remainingCredits: Number(updAcc.rows[0]?.credits ?? 0),
      characters: await getAccountCharacters(acc.login_name)
    };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {
    });
    throw err;
  } finally {
    client.release();
  }
}
async function deleteCharacter400ForCredits(params) {
  const cleanLogin = (params.loginName || "").trim();
  const cleanCharName = (params.characterName || "").trim();
  const cleanCode = (params.deleteCode || "").trim();
  if (!cleanLogin) {
    throw new TransactionDomainError("UNAUTHORIZED", 401, "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A\u0E01\u0E48\u0E2D\u0E19\u0E17\u0E33\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23");
  }
  if (!cleanCharName) {
    throw new TransactionDomainError("INVALID_CHAR_NAME", 400, "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23\u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E25\u0E1A");
  }
  if (!cleanCode || cleanCode.length < 4 || cleanCode.length > 32) {
    throw new TransactionDomainError(
      "INVALID_DELETE_CODE",
      400,
      "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E01\u0E23\u0E2D\u0E01\u0E23\u0E2B\u0E31\u0E2A\u0E25\u0E1A\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23 (Security Code) \u0E2B\u0E23\u0E37\u0E2D\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19"
    );
  }
  const reward = DELETE_CHAR_400_REWARD_CREDITS;
  if (!pgPool || !pgHealthy) {
    return await withAccountMutex(cleanLogin, async () => {
      const mem = memoryAccounts.get(cleanLogin.toLowerCase());
      if (!mem) {
        throw new TransactionDomainError("ACCOUNT_NOT_FOUND", 404, "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E1C\u0E39\u0E49\u0E40\u0E25\u0E48\u0E19\u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A");
      }
      if (memoryMembStat.get(cleanLogin.toLowerCase())?.ConnectStat === 1) {
        throw new TransactionDomainError(
          "ACCOUNT_ONLINE",
          409,
          "\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E15\u0E49\u0E2D\u0E07\u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E2D\u0E2D\u0E1F\u0E44\u0E25\u0E19\u0E4C (Offline) \u0E01\u0E48\u0E2D\u0E19\u0E25\u0E1A\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23"
        );
      }
      const codeMatchesSecurity = !mem.securityCode || mem.securityCode === "0000000" || mem.securityCode === cleanCode;
      const codeMatchesPassword = verifyAccountPassword(
        mem.passwordHash,
        mem.passwordPlainOrSimulatedBcrypt,
        cleanCode
      );
      if (!codeMatchesSecurity && !codeMatchesPassword) {
        throw new TransactionDomainError(
          "INVALID_DELETE_CODE",
          403,
          "\u0E23\u0E2B\u0E31\u0E2A\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E25\u0E1A\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23 (\u0E2B\u0E23\u0E37\u0E2D\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19\u0E1A\u0E31\u0E0D\u0E0A\u0E35) \u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E2D\u0E35\u0E01\u0E04\u0E23\u0E31\u0E49\u0E07"
        );
      }
      const targetChar = memoryCharacters.get(cleanCharName.toLowerCase());
      if (!targetChar || targetChar.accountId.toLowerCase() !== cleanLogin.toLowerCase()) {
        throw new TransactionDomainError(
          "CHAR_NOT_FOUND",
          404,
          "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23\u0E19\u0E35\u0E49\u0E43\u0E19\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13"
        );
      }
      if (targetChar.ctlCode !== 0) {
        throw new TransactionDomainError(
          "CHAR_BANNED",
          403,
          "\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E25\u0E1A\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23\u0E17\u0E35\u0E48\u0E15\u0E34\u0E14\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E41\u0E1A\u0E19\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E41\u0E25\u0E01\u0E40\u0E04\u0E23\u0E14\u0E34\u0E15\u0E44\u0E14\u0E49"
        );
      }
      if (targetChar.level !== 400) {
        throw new TransactionDomainError(
          "CHAR_LEVEL_NOT_400",
          400,
          `\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23 "${targetChar.name}" \u0E21\u0E35\u0E40\u0E25\u0E40\u0E27\u0E25 ${targetChar.level} (\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E40\u0E25\u0E40\u0E27\u0E25 400 \u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19)`
        );
      }
      memoryCharacters.delete(cleanCharName.toLowerCase());
      mem.credits += reward;
      await recordAuditLog({
        accountId: mem.loginName,
        ipAddress: params.ipAddress,
        action: "DELETE_CHARACTER_400",
        status: "COMMITTED",
        creditsDelta: reward,
        details: `Deleted Lv.400 character "${targetChar.name}" in exchange for +${reward} Credits`
      });
      return {
        ok: true,
        deletedCharacterName: targetChar.name,
        rewardCredits: reward,
        remainingCredits: mem.credits,
        characters: await getAccountCharacters(mem.loginName)
      };
    });
  }
  const client = await pgPool.connect();
  try {
    await client.query("BEGIN");
    const membRes = await client.query(
      `SELECT "ConnectStat" FROM "MEMB_STAT" WHERE LOWER("memb___id") = LOWER($1) FOR SHARE`,
      [cleanLogin]
    );
    if (membRes.rows[0]?.ConnectStat === 1) {
      throw new TransactionDomainError(
        "ACCOUNT_ONLINE",
        409,
        "\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E15\u0E49\u0E2D\u0E07\u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E2D\u0E2D\u0E1F\u0E44\u0E25\u0E19\u0E4C (Offline) \u0E01\u0E48\u0E2D\u0E19\u0E25\u0E1A\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23"
      );
    }
    const lockAcc = await client.query(
      `SELECT login_name, security_code, credits
         FROM webshop_accounts
        WHERE LOWER(login_name) = LOWER($1)
        FOR UPDATE`,
      [cleanLogin]
    );
    const acc = lockAcc.rows[0];
    if (!acc) {
      throw new TransactionDomainError("ACCOUNT_NOT_FOUND", 404, "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E1C\u0E39\u0E49\u0E40\u0E25\u0E48\u0E19\u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A");
    }
    let codeVerified = false;
    if (acc.security_code && acc.security_code !== "0000000" && acc.security_code === cleanCode) {
      codeVerified = true;
    }
    await client.query("SAVEPOINT sp_verify_openmu_code");
    try {
      const omuAccRes = await client.query(
        `SELECT "SecurityCode", "PasswordHash"
           FROM data."Account"
          WHERE LOWER("LoginName") = LOWER($1)
          LIMIT 1`,
        [cleanLogin]
      );
      const omuAcc = omuAccRes.rows[0];
      if (omuAcc) {
        if (omuAcc.SecurityCode && omuAcc.SecurityCode.trim() !== "") {
          if (omuAcc.SecurityCode.trim() === cleanCode) {
            codeVerified = true;
          }
        } else if (!acc.security_code || acc.security_code === "0000000") {
          codeVerified = true;
        }
        if (!codeVerified && omuAcc.PasswordHash) {
          if (await bcrypt.compare(cleanCode, omuAcc.PasswordHash)) {
            codeVerified = true;
          }
        }
      } else if (!acc.security_code || acc.security_code === "0000000") {
        codeVerified = true;
      }
      await client.query("RELEASE SAVEPOINT sp_verify_openmu_code");
    } catch {
      await client.query("ROLLBACK TO SAVEPOINT sp_verify_openmu_code");
      if (!acc.security_code || acc.security_code === "0000000") {
        codeVerified = true;
      }
    }
    if (!codeVerified) {
      throw new TransactionDomainError(
        "INVALID_DELETE_CODE",
        403,
        "\u0E23\u0E2B\u0E31\u0E2A\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E25\u0E1A\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23 (Security Code \u0E2B\u0E23\u0E37\u0E2D\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19\u0E1A\u0E31\u0E0D\u0E0A\u0E35) \u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07"
      );
    }
    let deletedCharName = "";
    const wsCharRes = await client.query(
      `SELECT name, level, ctl_code
         FROM webshop_characters
        WHERE LOWER(account_login) = LOWER($1)
          AND LOWER(name) = LOWER($2)
        FOR UPDATE`,
      [acc.login_name, cleanCharName]
    );
    if (wsCharRes.rows[0]) {
      const ch = wsCharRes.rows[0];
      if (Number(ch.ctl_code) !== 0) {
        throw new TransactionDomainError(
          "CHAR_BANNED",
          403,
          "\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E25\u0E1A\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23\u0E17\u0E35\u0E48\u0E15\u0E34\u0E14\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E41\u0E1A\u0E19\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E41\u0E25\u0E01\u0E40\u0E04\u0E23\u0E14\u0E34\u0E15\u0E44\u0E14\u0E49"
        );
      }
      if (Number(ch.level) !== 400) {
        throw new TransactionDomainError(
          "CHAR_LEVEL_NOT_400",
          400,
          `\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23 "${ch.name}" \u0E21\u0E35\u0E40\u0E25\u0E40\u0E27\u0E25 ${ch.level} (\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E40\u0E25\u0E40\u0E27\u0E25 400 \u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19)`
        );
      }
      await client.query(`DELETE FROM webshop_characters WHERE name = $1`, [ch.name]);
      deletedCharName = ch.name;
    }
    await client.query("SAVEPOINT sp_delete_openmu_char");
    try {
      const omuCharRes = await client.query(
        `SELECT c."Id",
                c."Name",
                COALESCE(c."CharacterStatus", 0)::int AS "CharacterStatus",
                COALESCE(
                  (SELECT MAX(sa."Value")::int
                     FROM data."StatAttribute" sa
                     JOIN config."AttributeDefinition" ad ON ad."Id" = sa."DefinitionId"
                    WHERE sa."CharacterId" = c."Id"
                      AND LOWER(ad."Designation") LIKE '%level%'),
                  400
                ) AS "Level"
           FROM data."Character" c
           JOIN data."Account" a ON a."Id" = c."AccountId"
          WHERE LOWER(a."LoginName") = LOWER($1)
            AND LOWER(c."Name") = LOWER($2)
          LIMIT 1`,
        [acc.login_name, cleanCharName]
      );
      const omuChar = omuCharRes.rows[0];
      if (omuChar) {
        if (Number(omuChar.CharacterStatus) !== 0) {
          throw new TransactionDomainError(
            "CHAR_BANNED",
            403,
            "\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E25\u0E1A\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23\u0E17\u0E35\u0E48\u0E15\u0E34\u0E14\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E41\u0E1A\u0E19\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E41\u0E25\u0E01\u0E40\u0E04\u0E23\u0E14\u0E34\u0E15\u0E44\u0E14\u0E49"
          );
        }
        if (Number(omuChar.Level) < 400) {
          throw new TransactionDomainError(
            "CHAR_LEVEL_NOT_400",
            400,
            `\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23 "${omuChar.Name}" \u0E21\u0E35\u0E40\u0E25\u0E40\u0E27\u0E25 ${omuChar.Level} (\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E40\u0E25\u0E40\u0E27\u0E25 400 \u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19)`
          );
        }
        await client.query(`DELETE FROM data."Character" WHERE "Id" = $1`, [omuChar.Id]);
        deletedCharName = omuChar.Name;
      }
      await client.query("RELEASE SAVEPOINT sp_delete_openmu_char");
    } catch (innerErr) {
      await client.query("ROLLBACK TO SAVEPOINT sp_delete_openmu_char");
      if (innerErr instanceof TransactionDomainError) {
        throw innerErr;
      }
    }
    if (!deletedCharName) {
      throw new TransactionDomainError(
        "CHAR_NOT_FOUND",
        404,
        "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23\u0E40\u0E25\u0E40\u0E27\u0E25 400 \u0E17\u0E35\u0E48\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E43\u0E19\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13"
      );
    }
    const updAcc = await client.query(
      `UPDATE webshop_accounts
          SET credits = credits + $1,
              updated_at = NOW()
        WHERE login_name = $2
        RETURNING credits`,
      [reward, acc.login_name]
    );
    await recordAuditLog(
      {
        accountId: acc.login_name,
        ipAddress: params.ipAddress,
        action: "DELETE_CHARACTER_400",
        status: "COMMITTED",
        creditsDelta: reward,
        details: `Deleted Lv.400 character "${deletedCharName}" in exchange for +${reward} Credits`
      },
      client
    );
    await client.query("COMMIT");
    return {
      ok: true,
      deletedCharacterName: deletedCharName,
      rewardCredits: reward,
      remainingCredits: Number(updAcc.rows[0]?.credits ?? 0),
      characters: await getAccountCharacters(acc.login_name)
    };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {
    });
    throw err;
  } finally {
    client.release();
  }
}
async function reserveCreditExchange(loginName, credits, wCoinC, idempotencyKey) {
  if (!pgPool || !pgHealthy) {
    const existing = memoryCreditExchanges.get(idempotencyKey);
    if (existing) {
      if (existing.account_login.toLowerCase() !== loginName.toLowerCase() || existing.credits_spent !== credits || existing.wcoinc_granted !== wCoinC) throw new Error("Idempotency key was already used for a different exchange.");
      return existing.status;
    }
    const mem = memoryAccounts.get(loginName.trim().toLowerCase());
    if (!mem || mem.credits < credits) throw new TransactionDomainError("INSUFFICIENT_CREDITS", 409, "Not enough webshop credits.");
    mem.credits -= credits;
    memoryCreditExchanges.set(idempotencyKey, {
      status: "pending",
      account_login: loginName,
      credits_spent: credits,
      wcoinc_granted: wCoinC
    });
    return "pending";
  }
  const client = await pgPool.connect();
  try {
    await client.query("BEGIN");
    const existing = await client.query(
      "SELECT status, account_login, credits_spent, wcoinc_granted FROM webshop_credit_exchanges WHERE idempotency_key = $1 FOR UPDATE",
      [idempotencyKey]
    );
    if (existing.rows[0]) {
      const row = existing.rows[0];
      if (row.account_login.toLowerCase() !== loginName.toLowerCase() || row.credits_spent !== credits || row.wcoinc_granted !== wCoinC) throw new Error("Idempotency key was already used for a different exchange.");
      await client.query("COMMIT");
      return row.status;
    }
    const wallet = await client.query(
      `UPDATE webshop_accounts SET credits = credits - $1, updated_at = NOW()
        WHERE LOWER(login_name) = LOWER($2) AND credits >= $1 RETURNING login_name`,
      [credits, loginName]
    );
    if (wallet.rowCount !== 1) throw new TransactionDomainError("INSUFFICIENT_CREDITS", 409, "Not enough webshop credits.");
    await client.query(
      `INSERT INTO webshop_credit_exchanges (idempotency_key, account_login, credits_spent, wcoinc_granted, status)
       VALUES ($1, $2, $3, $4, 'pending')`,
      [idempotencyKey, loginName, credits, wCoinC]
    );
    await client.query("COMMIT");
    return "pending";
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
async function completeCreditExchange(idempotencyKey) {
  if (!pgPool || !pgHealthy) {
    const entry = memoryCreditExchanges.get(idempotencyKey);
    if (entry) {
      entry.status = "completed";
      const mem = memoryAccounts.get(entry.account_login.trim().toLowerCase());
      if (mem) {
        mem.wCoinC += entry.wcoinc_granted;
      }
    }
    return;
  }
  await pgPool.query(`UPDATE webshop_credit_exchanges SET status = 'completed', completed_at = NOW() WHERE idempotency_key = $1`, [idempotencyKey]);
}
var accountLocks = /* @__PURE__ */ new Map();
async function withAccountMutex(accountKey, task) {
  const normalized = accountKey.trim().toLowerCase();
  const prev = accountLocks.get(normalized) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => {
    release = resolve;
  });
  const chained = prev.then(() => current);
  accountLocks.set(normalized, chained);
  await prev;
  try {
    return await task();
  } finally {
    release();
    if (accountLocks.get(normalized) === chained) {
      accountLocks.delete(normalized);
    }
  }
}
async function getCatalogBundleCached() {
  const cached = await cacheGetJson(CATALOG_CACHE_KEY);
  if (cached) {
    return { bundle: cached, cacheHit: true };
  }
  const categories = Object.entries(CATEGORY_NAMES).map(([idStr, names]) => {
    const catId = Number(idStr);
    let activeCount = 0;
    let bannedCount = 0;
    for (const item of serverCatalog) {
      if (item.category === catId) {
        if (item.credits > 0) activeCount += 1;
        else bannedCount += 1;
      }
    }
    return {
      id: catId,
      names,
      activeCount,
      bannedCount
    };
  });
  const bundle = {
    version: catalogVersion,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    items: serverCatalog,
    categories,
    groups: serverGroups,
    pricing: serverConfig.credits,
    limits: serverConfig.limit
  };
  await Promise.all([
    cacheSetJson(CATALOG_CACHE_KEY, bundle),
    cacheSetJson(CATALOG_ITEMS_CACHE_KEY, bundle.items),
    cacheSetJson(CATALOG_CATEGORIES_CACHE_KEY, bundle.categories),
    cacheSetJson(CATALOG_PRICING_CACHE_KEY, {
      pricing: bundle.pricing,
      limits: bundle.limits
    })
  ]);
  return { bundle, cacheHit: false };
}
async function invalidateCatalogCache() {
  catalogVersion += 1;
  await cacheDeleteKeys([
    CATALOG_CACHE_KEY,
    CATALOG_ITEMS_CACHE_KEY,
    CATALOG_CATEGORIES_CACHE_KEY,
    CATALOG_PRICING_CACHE_KEY
  ]);
}
async function upsertCatalogItem(item) {
  if (pgPool && pgHealthy) {
    await pgPool.query(
      `INSERT INTO webshop_catalog_openmu_mappings
         (item_uid, package_sequence, price_sequence, item_json, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (item_uid) DO UPDATE SET
         package_sequence = EXCLUDED.package_sequence,
         price_sequence = EXCLUDED.price_sequence,
         item_json = EXCLUDED.item_json,
         updated_at = NOW()`,
      [item.uid, item.openMuPackageSequence ?? null, item.openMuPriceSequence ?? null, item]
    );
  }
  const idx = serverCatalog.findIndex((c) => c.uid === item.uid);
  if (idx >= 0) {
    serverCatalog[idx] = { ...item };
  } else {
    serverCatalog.push({ ...item });
  }
  await invalidateCatalogCache();
  return item;
}
async function deleteCatalogItem(uid) {
  if (pgPool && pgHealthy) {
    await pgPool.query(
      "DELETE FROM webshop_catalog_openmu_mappings WHERE item_uid = $1",
      [uid]
    );
  }
  const before = serverCatalog.length;
  serverCatalog = serverCatalog.filter((c) => c.uid !== uid);
  if (serverCatalog.length !== before) {
    await invalidateCatalogCache();
    return true;
  }
  return false;
}
async function upsertCatalogGroup(group) {
  const idx = serverGroups.findIndex((g) => g.id === group.id);
  if (idx >= 0) {
    serverGroups[idx] = { ...group };
  } else {
    serverGroups.push({ ...group });
  }
  await invalidateCatalogCache();
  return group;
}
async function deleteCatalogGroup(id) {
  const before = serverGroups.length;
  serverGroups = serverGroups.filter((g) => g.id !== id);
  if (serverGroups.length !== before) {
    await invalidateCatalogCache();
    return true;
  }
  return false;
}
var PROMO_CACHE_KEY = "webshop:promotions:v1";
function buildDefaultPromotionConfig() {
  const baseCreditsPerThb = 10;
  const baseWCoinCPerThb = 0;
  const usdToThbRate = 35;
  const unifiedLadder = [
    {
      amountThb: 50,
      bonusPercent: 0,
      code: "PKG_50",
      name: "Mu Origins Explorer Pack",
      nameTh: "\u0E41\u0E1E\u0E47\u0E01\u0E40\u0E01\u0E08\u0E19\u0E31\u0E01\u0E1C\u0E08\u0E0D\u0E20\u0E31\u0E22 Mu Origins",
      bonusTextTh: "\u0E40\u0E23\u0E17\u0E21\u0E32\u0E15\u0E23\u0E10\u0E32\u0E19",
      bonusTextEn: "Standard Rate"
    },
    {
      amountThb: 100,
      bonusPercent: 3,
      code: "PKG_100",
      name: "Mu Origins Starter Pack",
      nameTh: "\u0E41\u0E1E\u0E47\u0E01\u0E40\u0E01\u0E08\u0E1C\u0E39\u0E49\u0E40\u0E23\u0E34\u0E48\u0E21\u0E15\u0E49\u0E19 Mu Origins",
      bonusTextTh: "\u0E42\u0E1A\u0E19\u0E31\u0E2A +3%",
      bonusTextEn: "+3% Bonus"
    },
    {
      amountThb: 150,
      bonusPercent: 5,
      code: "PKG_150",
      name: "Lorencia Vanguard Pack",
      nameTh: "\u0E41\u0E1E\u0E47\u0E01\u0E40\u0E01\u0E08\u0E41\u0E19\u0E27\u0E2B\u0E19\u0E49\u0E32 Lorencia",
      bonusTextTh: "\u0E42\u0E1A\u0E19\u0E31\u0E2A +5%",
      bonusTextEn: "+5% Bonus"
    },
    {
      amountThb: 300,
      bonusPercent: 8,
      code: "PKG_300",
      name: "Blade Knight Treasury",
      nameTh: "\u0E41\u0E1E\u0E47\u0E01\u0E40\u0E01\u0E08\u0E02\u0E38\u0E19\u0E1E\u0E25 Blade Knight",
      bonusTextTh: "\u0E42\u0E1A\u0E19\u0E31\u0E2A +8%",
      bonusTextEn: "+8% Bonus"
    },
    {
      amountThb: 500,
      bonusPercent: 10,
      code: "PKG_500",
      name: "Icarus Sky Sovereign",
      nameTh: "\u0E41\u0E1E\u0E47\u0E01\u0E40\u0E01\u0E08\u0E40\u0E08\u0E49\u0E32\u0E40\u0E27\u0E2B\u0E32 Icarus",
      bonusTextTh: "\u0E22\u0E2D\u0E14\u0E19\u0E34\u0E22\u0E21 \xB7 \u0E42\u0E1A\u0E19\u0E31\u0E2A +10%",
      bonusTextEn: "Popular \xB7 +10% Bonus"
    },
    {
      amountThb: 1e3,
      bonusPercent: 15,
      code: "PKG_1000",
      name: "Kundun Conqueror Chest",
      nameTh: "\u0E41\u0E1E\u0E47\u0E01\u0E40\u0E01\u0E08\u0E1C\u0E39\u0E49\u0E1E\u0E34\u0E0A\u0E34\u0E15 Kundun",
      bonusTextTh: "\u0E04\u0E38\u0E49\u0E21\u0E04\u0E48\u0E32\u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14 \xB7 \u0E42\u0E1A\u0E19\u0E31\u0E2A +15%",
      bonusTextEn: "Best Value \xB7 +15% Bonus"
    }
  ];
  const trueMoneyTiers = unifiedLadder.map((row) => ({
    amountThb: row.amountThb,
    bonusPercent: row.bonusPercent,
    credits: Math.round(row.amountThb * baseCreditsPerThb * (1 + row.bonusPercent / 100)),
    wCoinC: Math.round(row.amountThb * baseWCoinCPerThb * (1 + row.bonusPercent / 100)),
    bonusText: row.bonusTextTh,
    bonusTextEn: row.bonusTextEn,
    enabled: true
  }));
  const payPalPackages = unifiedLadder.map((row) => ({
    code: row.code,
    name: row.name,
    nameTh: row.nameTh,
    priceThb: row.amountThb,
    priceUsd: Number((row.amountThb / usdToThbRate).toFixed(2)),
    bonusPercent: row.bonusPercent,
    credits: Math.round(row.amountThb * baseCreditsPerThb * (1 + row.bonusPercent / 100)),
    wCoinC: Math.round(row.amountThb * baseWCoinCPerThb * (1 + row.bonusPercent / 100)),
    bonusTag: row.bonusTextEn,
    bonusTagTh: row.bonusTextTh,
    enabled: true
  }));
  return {
    campaignActive: false,
    campaignTitleTh: "\u0E42\u0E1B\u0E23\u0E42\u0E21\u0E0A\u0E31\u0E48\u0E19\u0E40\u0E15\u0E34\u0E21\u0E40\u0E07\u0E34\u0E19\u0E1E\u0E34\u0E40\u0E28\u0E29 \u0E23\u0E31\u0E1A\u0E42\u0E1A\u0E19\u0E31\u0E2A\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E17\u0E38\u0E01\u0E0A\u0E48\u0E2D\u0E07\u0E17\u0E32\u0E07 (TrueMoney & PayPal)",
    campaignTitleEn: "Special Top-Up Event: Extra Bonus Across TrueMoney & PayPal",
    extraBonusPercent: 0,
    baseCreditsPerThb,
    baseWCoinCPerThb,
    usdToThbRate,
    merchantPhone: process.env.TRUEMONEY_MERCHANT_PHONE || "",
    trueMoneyTiers,
    payPalPackages,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedBy: "system"
  };
}
function sanitizePromotionConfig(raw, updatedBy) {
  const defaults = buildDefaultPromotionConfig();
  const baseCreditsPerThb = Math.max(
    1,
    Math.min(1e3, Number(raw.baseCreditsPerThb) || defaults.baseCreditsPerThb)
  );
  const baseWCoinCPerThb = Math.max(
    0,
    Math.min(1e3, Number(raw.baseWCoinCPerThb ?? defaults.baseWCoinCPerThb))
  );
  const usdToThbRate = Math.max(
    1,
    Math.min(200, Number(raw.usdToThbRate) || defaults.usdToThbRate)
  );
  const extraBonusPercent = Math.max(
    0,
    Math.min(300, Math.round(Number(raw.extraBonusPercent) || 0))
  );
  const trueMoneyTiers = Array.isArray(raw.trueMoneyTiers) && raw.trueMoneyTiers.length > 0 ? raw.trueMoneyTiers.map((t) => {
    const amountThb = Math.max(1, Math.round(Number(t.amountThb) || 50));
    const bonusPercent = Math.max(
      0,
      Math.min(500, Math.round(Number(t.bonusPercent) || 0))
    );
    const credits = Math.max(1, Math.round(Number(t.credits) || amountThb * baseCreditsPerThb));
    const wCoinC = Math.max(0, Math.round(Number(t.wCoinC) || 0));
    return {
      amountThb,
      bonusPercent,
      credits,
      wCoinC,
      bonusText: String(t.bonusText || "").trim() || (bonusPercent > 0 ? `\u0E42\u0E1A\u0E19\u0E31\u0E2A +${bonusPercent}%` : "\u0E40\u0E23\u0E17\u0E21\u0E32\u0E15\u0E23\u0E10\u0E32\u0E19"),
      bonusTextEn: String(t.bonusTextEn || "").trim() || (bonusPercent > 0 ? `+${bonusPercent}% Bonus` : "Standard Rate"),
      enabled: t.enabled !== false
    };
  }).sort((a, b) => a.amountThb - b.amountThb) : defaults.trueMoneyTiers;
  const payPalPackages = Array.isArray(raw.payPalPackages) && raw.payPalPackages.length > 0 ? raw.payPalPackages.map((p, idx) => {
    const priceThb = Math.max(1, Math.round(Number(p.priceThb) || 100));
    const priceUsd = Math.max(
      0.5,
      Number((Number(p.priceUsd) || priceThb / usdToThbRate).toFixed(2))
    );
    const bonusPercent = Math.max(
      0,
      Math.min(500, Math.round(Number(p.bonusPercent) || 0))
    );
    const credits = Math.max(
      1,
      Math.round(Number(p.credits) || priceThb * baseCreditsPerThb)
    );
    const wCoinC = Math.max(0, Math.round(Number(p.wCoinC) || 0));
    const cleanCode = String(p.code || `PKG_${priceThb}_${idx + 1}`).trim().replace(/[^a-zA-Z0-9_-]/g, "_").toUpperCase() || `PKG_${idx + 1}`;
    return {
      code: cleanCode,
      name: String(p.name || `Mu Origins Pack ${priceThb} THB`).trim(),
      nameTh: String(p.nameTh || `\u0E41\u0E1E\u0E47\u0E01\u0E40\u0E01\u0E08 Mu Origins ${priceThb} \u0E1A\u0E32\u0E17`).trim(),
      priceUsd,
      priceThb,
      bonusPercent,
      credits,
      wCoinC,
      bonusTag: String(p.bonusTag || "").trim() || (bonusPercent > 0 ? `+${bonusPercent}% Bonus` : "Standard Rate"),
      bonusTagTh: String(p.bonusTagTh || "").trim() || (bonusPercent > 0 ? `\u0E42\u0E1A\u0E19\u0E31\u0E2A +${bonusPercent}%` : "\u0E40\u0E23\u0E17\u0E21\u0E32\u0E15\u0E23\u0E10\u0E32\u0E19"),
      enabled: p.enabled !== false
    };
  }) : defaults.payPalPackages;
  return {
    campaignActive: Boolean(raw.campaignActive),
    campaignTitleTh: String(raw.campaignTitleTh || "").trim() || defaults.campaignTitleTh,
    campaignTitleEn: String(raw.campaignTitleEn || "").trim() || defaults.campaignTitleEn,
    extraBonusPercent,
    baseCreditsPerThb,
    baseWCoinCPerThb,
    usdToThbRate,
    merchantPhone: String(raw.merchantPhone ?? defaults.merchantPhone).trim(),
    trueMoneyTiers,
    payPalPackages,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedBy: updatedBy || raw.updatedBy || "admin"
  };
}
function getPromotionConfig() {
  return structuredClone(memoryPromotionConfig);
}
function getEffectivePromotions() {
  const cfg = getPromotionConfig();
  const mult = cfg.campaignActive && cfg.extraBonusPercent > 0 ? 1 + cfg.extraBonusPercent / 100 : 1;
  const effectiveTrueMoneyTiers = cfg.trueMoneyTiers.filter((t) => t.enabled !== false).map((t) => ({
    ...t,
    baseCredits: t.credits,
    baseWCoinC: t.wCoinC,
    credits: Math.round(t.credits * mult),
    wCoinC: Math.round(t.wCoinC * mult)
  }));
  const effectivePayPalPackages = cfg.payPalPackages.filter((p) => p.enabled !== false).map((p) => ({
    ...p,
    baseCredits: p.credits,
    baseWCoinC: p.wCoinC,
    credits: Math.round(p.credits * mult),
    wCoinC: Math.round(p.wCoinC * mult)
  }));
  return {
    config: cfg,
    effectiveTrueMoneyTiers,
    effectivePayPalPackages
  };
}
async function updatePromotionConfig(patch, updatedBy = "admin") {
  const merged = sanitizePromotionConfig(
    {
      ...memoryPromotionConfig,
      ...patch
    },
    updatedBy
  );
  memoryPromotionConfig = merged;
  if (pgPool && pgHealthy) {
    await pgPool.query(
      `INSERT INTO webshop_promotions_config (id, config_json, updated_at)
       VALUES (1, $1::jsonb, NOW())
       ON CONFLICT (id)
       DO UPDATE SET config_json = EXCLUDED.config_json, updated_at = NOW()`,
      [JSON.stringify(merged)]
    );
  }
  await cacheDeleteKeys([PROMO_CACHE_KEY]);
  return structuredClone(memoryPromotionConfig);
}
async function resetPromotionConfigToDefault(updatedBy = "admin") {
  const reset = sanitizePromotionConfig(buildDefaultPromotionConfig(), updatedBy);
  memoryPromotionConfig = reset;
  if (pgPool && pgHealthy) {
    await pgPool.query(
      `INSERT INTO webshop_promotions_config (id, config_json, updated_at)
       VALUES (1, $1::jsonb, NOW())
       ON CONFLICT (id)
       DO UPDATE SET config_json = EXCLUDED.config_json, updated_at = NOW()`,
      [JSON.stringify(reset)]
    );
  }
  await cacheDeleteKeys([PROMO_CACHE_KEY]);
  return structuredClone(memoryPromotionConfig);
}
async function queryMembStatOnlineStatus(loginName) {
  const key = loginName.trim().toLowerCase();
  if (pgPool && pgHealthy) {
    const { rows } = await pgPool.query(
      `SELECT "memb___id", "ConnectStat", "ServerName", "IP", "ConnectTM", "DisConnectTM"
       FROM "MEMB_STAT"
       WHERE LOWER("memb___id") = LOWER($1)
       LIMIT 1`,
      [loginName.trim()]
    );
    if (rows[0]) {
      return {
        memb___id: rows[0].memb___id,
        ConnectStat: rows[0].ConnectStat === 1 ? 1 : 0,
        ServerName: rows[0].ServerName,
        IP: rows[0].IP,
        ConnectTM: rows[0].ConnectTM ? rows[0].ConnectTM.toISOString() : null,
        DisConnectTM: rows[0].DisConnectTM ? rows[0].DisConnectTM.toISOString() : null
      };
    }
  }
  return memoryMembStat.get(key) || {
    memb___id: loginName.trim(),
    ConnectStat: 0,
    ServerName: "Offline",
    IP: "0.0.0.0",
    ConnectTM: null,
    DisConnectTM: null
  };
}
async function setMembStatConnectionState(loginName, connectStat, ipAddress, serverName = "Continent-of-Lorencia-1") {
  const clean = loginName.trim();
  const key = clean.toLowerCase();
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  const updated = {
    memb___id: clean,
    ConnectStat: connectStat,
    ServerName: serverName,
    IP: ipAddress,
    ConnectTM: connectStat === 1 ? nowIso : memoryMembStat.get(key)?.ConnectTM || null,
    DisConnectTM: connectStat === 0 ? nowIso : memoryMembStat.get(key)?.DisConnectTM || null
  };
  memoryMembStat.set(key, updated);
  if (pgPool && pgHealthy) {
    await pgPool.query(
      `INSERT INTO "MEMB_STAT" ("memb___id", "ConnectStat", "ServerName", "IP", "ConnectTM", "DisConnectTM")
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT ("memb___id") DO UPDATE SET
         "ConnectStat" = EXCLUDED."ConnectStat",
         "ServerName" = EXCLUDED."ServerName",
         "IP" = EXCLUDED."IP",
         "ConnectTM" = EXCLUDED."ConnectTM",
         "DisConnectTM" = EXCLUDED."DisConnectTM"`,
      [clean, connectStat, serverName, ipAddress, updated.ConnectTM, updated.DisConnectTM]
    );
  }
  return updated;
}
function validateAuthoritativeOrderReference(reference) {
  const clean = reference.trim();
  if (!/^webshop:order:[A-Za-z0-9-]{8,100}$/.test(clean)) {
    throw new TransactionDomainError(
      "INVALID_IDEMPOTENCY_KEY",
      400,
      "A valid immutable Idempotency-Key is required."
    );
  }
  return clean;
}
function getAuthoritativeCatalogItem(itemUid) {
  const item = serverCatalog.find((candidate) => candidate.uid === itemUid);
  if (!item) {
    throw new TransactionDomainError("ITEM_NOT_FOUND", 404, "Catalog item not found.");
  }
  if (!Number.isInteger(item.openMuPackageSequence) || item.openMuPackageSequence < 0) {
    throw new TransactionDomainError(
      "AUTHORITATIVE_OFFER_NOT_MAPPED",
      422,
      "This item is not mapped to an authoritative OpenMU cash shop offer."
    );
  }
  if (!Number.isInteger(item.credits) || item.credits <= 0) {
    throw new TransactionDomainError("ITEM_NOT_FOR_SALE", 422, "This item is not for sale.");
  }
  return item;
}
async function reserveAuthoritativeItemOrder(params) {
  const accountLogin = params.accountLogin.trim();
  const reference = validateAuthoritativeOrderReference(params.reference);
  const item = getAuthoritativeCatalogItem(params.itemUid);
  const packageSequence = item.openMuPackageSequence;
  const priceSequence = item.openMuPriceSequence ?? null;
  const chargedCredits = item.credits;
  if (pgPool && pgHealthy) {
    const client = await pgPool.connect();
    try {
      await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
      const existingResult = await client.query(
        `SELECT o.*, a.credits
         FROM webshop_item_orders o
         JOIN webshop_accounts a ON LOWER(a.login_name) = LOWER(o.account_login)
         WHERE o.reference = $1
         FOR UPDATE OF o`,
        [reference]
      );
      const existing = existingResult.rows[0];
      if (existing) {
        if (existing.account_login.toLowerCase() !== accountLogin.toLowerCase() || existing.item_uid !== item.uid || existing.package_sequence !== packageSequence || existing.price_sequence !== priceSequence || existing.charged_credits !== chargedCredits) {
          throw new TransactionDomainError(
            "IDEMPOTENCY_CONFLICT",
            409,
            "The Idempotency-Key is already bound to another order."
          );
        }
        await client.query("COMMIT");
        return {
          reference: existing.reference,
          accountLogin: existing.account_login,
          itemUid: existing.item_uid,
          packageSequence: existing.package_sequence,
          priceSequence: existing.price_sequence,
          chargedCredits: existing.charged_credits,
          status: existing.status,
          openMuGrantId: existing.openmu_grant_id,
          failureCode: existing.failure_code,
          remainingCredits: existing.credits
        };
      }
      const accountResult = await client.query(
        `SELECT login_name, credits
         FROM webshop_accounts
         WHERE LOWER(login_name) = LOWER($1)
         FOR UPDATE`,
        [accountLogin]
      );
      const account = accountResult.rows[0];
      if (!account) {
        throw new TransactionDomainError("ACCOUNT_NOT_FOUND", 404, "Account not found.");
      }
      if (account.credits < chargedCredits) {
        throw new TransactionDomainError("INSUFFICIENT_CREDITS", 402, "Insufficient credits.");
      }
      const remainingCredits = account.credits - chargedCredits;
      await client.query(
        `UPDATE webshop_accounts SET credits = $2, updated_at = NOW() WHERE login_name = $1`,
        [account.login_name, remainingCredits]
      );
      await client.query(
        `INSERT INTO webshop_item_orders
           (reference, account_login, item_uid, package_sequence, price_sequence,
            charged_credits, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending')`,
        [reference, account.login_name, item.uid, packageSequence, priceSequence, chargedCredits]
      );
      await client.query("COMMIT");
      return {
        reference,
        accountLogin: account.login_name,
        itemUid: item.uid,
        packageSequence,
        priceSequence,
        chargedCredits,
        status: "pending",
        openMuGrantId: null,
        failureCode: null,
        remainingCredits
      };
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {
      });
      throw error;
    } finally {
      client.release();
    }
  }
  return withAccountMutex(accountLogin, async () => {
    const existing = memoryAuthoritativeItemOrders.get(reference);
    if (existing) {
      if (existing.accountLogin.toLowerCase() !== accountLogin.toLowerCase() || existing.itemUid !== item.uid || existing.packageSequence !== packageSequence || existing.priceSequence !== priceSequence || existing.chargedCredits !== chargedCredits) {
        throw new TransactionDomainError(
          "IDEMPOTENCY_CONFLICT",
          409,
          "The Idempotency-Key is already bound to another order."
        );
      }
      return { ...existing };
    }
    const account = memoryAccounts.get(accountLogin.toLowerCase());
    if (!account) throw new TransactionDomainError("ACCOUNT_NOT_FOUND", 404, "Account not found.");
    if (account.credits < chargedCredits) {
      throw new TransactionDomainError("INSUFFICIENT_CREDITS", 402, "Insufficient credits.");
    }
    account.credits -= chargedCredits;
    const order = {
      reference,
      accountLogin: account.loginName,
      itemUid: item.uid,
      packageSequence,
      priceSequence,
      chargedCredits,
      status: "pending",
      openMuGrantId: null,
      failureCode: null,
      remainingCredits: account.credits
    };
    memoryAuthoritativeItemOrders.set(reference, order);
    return { ...order };
  });
}
async function completeAuthoritativeItemOrder(reference, openMuGrantId) {
  if (pgPool && pgHealthy) {
    await pgPool.query(
      `UPDATE webshop_item_orders
       SET status = 'delivered', openmu_grant_id = $2, failure_code = NULL,
           updated_at = NOW()
       WHERE reference = $1 AND status IN ('pending', 'delivered')`,
      [reference, openMuGrantId]
    );
    return;
  }
  const order = memoryAuthoritativeItemOrders.get(reference);
  if (order && (order.status === "pending" || order.status === "delivered")) {
    order.status = "delivered";
    order.openMuGrantId = openMuGrantId;
    order.failureCode = null;
  }
}
async function failAuthoritativeItemOrder(reference, failureCode, refund) {
  if (pgPool && pgHealthy) {
    const client = await pgPool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `UPDATE webshop_item_orders
         SET status = $2, failure_code = $3, updated_at = NOW()
         WHERE reference = $1 AND status = 'pending'
         RETURNING account_login, charged_credits`,
        [reference, refund ? "rejected" : "manual_review", failureCode]
      );
      if (refund && result.rows[0]) {
        await client.query(
          `UPDATE webshop_accounts
           SET credits = credits + $2, updated_at = NOW()
           WHERE LOWER(login_name) = LOWER($1)`,
          [result.rows[0].account_login, result.rows[0].charged_credits]
        );
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {
      });
      throw error;
    } finally {
      client.release();
    }
    return;
  }
  const order = memoryAuthoritativeItemOrders.get(reference);
  if (!order || order.status !== "pending") return;
  order.status = refund ? "rejected" : "manual_review";
  order.failureCode = failureCode;
  if (refund) {
    const account = memoryAccounts.get(order.accountLogin.toLowerCase());
    if (account) {
      account.credits += order.chargedCredits;
      order.remainingCredits = account.credits;
    }
  }
}
async function executePurchaseGroupSetTx(req) {
  const cleanAccount = (req.accountId || "").trim();
  if (!cleanAccount) {
    throw new TransactionDomainError("INVALID_ACCOUNT", 400, "Account ID is required.");
  }
  const idemKey = req.idempotencyKey?.trim();
  if (idemKey) {
    const claim = await claimIdempotencyKey("purchase_set", `${cleanAccount}:${idemKey}`, 3600);
    if (claim.state === "COMPLETED") {
      return {
        ...claim.cachedResponse,
        idempotentReplay: true
      };
    }
    if (claim.state === "IN_PROGRESS") {
      throw new TransactionDomainError(
        "DUPLICATE_IN_FLIGHT",
        409,
        "Duplicate set purchase request is currently being processed."
      );
    }
  }
  try {
    const { bundle } = await getCatalogBundleCached();
    const group = bundle.groups.find((g) => g.id === Number(req.groupId));
    if (!group) {
      throw new TransactionDomainError("GROUP_NOT_FOUND", 404, "Item group not found.");
    }
    const memberItems = group.memberUids.map((u) => bundle.items.find((it) => it.uid === u)).filter((it) => Boolean(it));
    const sanitized = sanitizeAndPriceGroupSet(
      group,
      memberItems,
      {
        level: req.level,
        option: req.option,
        luck: req.luck,
        exlOptions: req.exlOptions,
        ancientStamina: req.ancientStamina
      },
      serverConfig
    );
    if (pgPool && pgHealthy) {
      const client = await pgPool.connect();
      try {
        await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
        const membRes = await client.query(
          `SELECT "ConnectStat", "ServerName"
           FROM "MEMB_STAT"
           WHERE LOWER("memb___id") = LOWER($1)
           FOR SHARE`,
          [cleanAccount]
        );
        if (membRes.rows[0]?.ConnectStat === 1) {
          throw new TransactionDomainError(
            "ACCOUNT_ONLINE_MEMB_STAT",
            409,
            `Rejected by MEMB_STAT Anti-Dupe Guard: Account "${cleanAccount}" is currently online (${membRes.rows[0].ServerName}, ConnectStat = 1).`
          );
        }
        const accRes = await client.query(
          `SELECT login_name, credits, wcoinc
           FROM webshop_accounts
           WHERE LOWER(login_name) = LOWER($1)
           FOR UPDATE`,
          [cleanAccount]
        );
        const dbAcc = accRes.rows[0];
        if (!dbAcc) {
          throw new TransactionDomainError("ACCOUNT_NOT_FOUND", 404, "Account not found.");
        }
        if (dbAcc.credits < sanitized.totalCredits) {
          throw new TransactionDomainError(
            "INSUFFICIENT_CREDITS",
            402,
            "You do not have enough credits to do that."
          );
        }
        const whRes = await client.query(
          `SELECT instance_id, slot_index, serial, item_hex, item_uid, item_id, item_type, name, width, height
           FROM webshop_warehouse_items
           WHERE LOWER(account_login) = LOWER($1)
           FOR UPDATE`,
          [dbAcc.login_name]
        );
        const simulatedVault = whRes.rows.map((r) => ({
          instanceId: r.instance_id,
          serial: r.serial,
          itemHex: r.item_hex,
          slotIndex: r.slot_index,
          itemUid: r.item_uid,
          itemId: r.item_id,
          itemType: r.item_type,
          name: r.name,
          X: r.width,
          Y: r.height,
          level: 0,
          option: 0,
          luck: false,
          skill: false,
          exlOptions: [false, false, false, false, false, false],
          ancientStamina: 0,
          fenrirVariant: 0,
          durability: 255,
          paidCredits: 0,
          canSellBack: false,
          purchasedAt: 0
        }));
        const createdInstances = [];
        const purchasedAt = Math.floor(Date.now() / 1e3);
        const exlMask = sanitized.exlOptions.reduce(
          (acc, on, idx) => on ? acc | 1 << idx : acc,
          0
        );
        for (const mItem of memberItems) {
          const slot = locateFreeWarehouseSlot(simulatedVault, mItem.X, mItem.Y);
          if (slot === 1337 || !verifySlotPlacement(simulatedVault, slot, mItem.X, mItem.Y)) {
            throw new TransactionDomainError(
              "WAREHOUSE_FULL",
              409,
              `You do not have enough free slots in your vault for all pieces of ${group.name} (failed at ${mItem.name}).`
            );
          }
          const seqRes = await client.query(
            `SELECT nextval('webshop_item_serial_seq') AS seq`
          );
          const seqNum = (Number(seqRes.rows[0].seq) & 4294967295) >>> 0 || 1;
          const serial = seqNum.toString(16).toUpperCase().padStart(8, "0");
          const lv = mItem.hasLevel === 1 ? sanitized.level : 0;
          const op = mItem.hasOption === 1 ? sanitized.option : 0;
          const lk = mItem.luck === 1 ? sanitized.luck : false;
          const itemHex = encodeSeason6ItemHex({
            itemId: mItem.id,
            itemType: mItem.type,
            level: lv,
            option: op,
            luck: lk,
            skill: false,
            durability: 255,
            serial,
            exlOptions: sanitized.exlOptions,
            ancientStamina: sanitized.ancientStamina,
            fenrirVariant: 0
          });
          const inst = {
            instanceId: `${serial}_${Date.now()}_${mItem.uid}`,
            serial,
            itemHex,
            slotIndex: slot,
            itemUid: mItem.uid,
            itemId: mItem.id,
            itemType: mItem.type,
            name: mItem.name,
            X: mItem.X,
            Y: mItem.Y,
            level: lv,
            option: op,
            luck: lk,
            skill: false,
            exlOptions: sanitized.exlOptions,
            ancientStamina: sanitized.ancientStamina,
            fenrirVariant: 0,
            durability: 255,
            paidCredits: Math.round(
              sanitized.totalCredits / Math.max(1, memberItems.length)
            ),
            canSellBack: false,
            purchasedAt
          };
          await client.query(
            `INSERT INTO webshop_warehouse_items (
              instance_id, account_login, slot_index, serial, item_hex,
              item_uid, item_id, item_type, name, width, height,
              item_level, item_option, luck, skill, exl_mask,
              ancient_stamina, fenrir_variant, durability, paid_credits,
              can_sell_back, purchased_at
            ) VALUES (
              $1, $2, $3, $4, $5,
              $6, $7, $8, $9, $10, $11,
              $12, $13, $14, FALSE, $15,
              $16, 0, 255, $17,
              FALSE, $18
            )`,
            [
              inst.instanceId,
              dbAcc.login_name,
              slot,
              serial,
              itemHex,
              mItem.uid,
              mItem.id,
              mItem.type,
              mItem.name,
              mItem.X,
              mItem.Y,
              lv,
              op,
              lk,
              exlMask,
              sanitized.ancientStamina,
              inst.paidCredits,
              purchasedAt
            ]
          );
          simulatedVault.push(inst);
          createdInstances.push(inst);
        }
        const deductRes = await client.query(
          `UPDATE webshop_accounts
           SET credits = credits - $1, updated_at = NOW()
           WHERE login_name = $2 AND credits >= $1
           RETURNING credits, wcoinc`,
          [sanitized.totalCredits, dbAcc.login_name]
        );
        if (deductRes.rowCount !== 1) {
          throw new TransactionDomainError(
            "BALANCE_RACE_ABORTED",
            409,
            "Concurrent credit modification detected; transaction rolled back."
          );
        }
        await recordAuditLog(
          {
            accountId: dbAcc.login_name,
            ipAddress: req.ipAddress,
            action: "PURCHASE_ITEM_SET",
            status: "COMMITTED",
            itemHex: createdInstances.map((i) => i.itemHex).join(","),
            itemSerial: createdInstances[0]?.serial || null,
            creditsDelta: -sanitized.totalCredits,
            idempotencyKey: idemKey || null,
            details: `Bought Set Pack "${group.name}" (${createdInstances.length} items, Serials: ${createdInstances.map((i) => i.serial).join(", ")}) for ${sanitized.totalCredits} credits`
          },
          client
        );
        await client.query("COMMIT");
        const responsePayload = {
          ok: true,
          chargedCredits: sanitized.totalCredits,
          chargedWCoinC: 0,
          remainingCredits: deductRes.rows[0].credits,
          remainingWCoinC: deductRes.rows[0].wcoinc,
          addedItems: createdInstances,
          warehouseHex3840: encodeWarehouseHex3840(simulatedVault),
          message: `Successfully added all ${createdInstances.length} pieces of ${group.name} to your warehouse vault!`
        };
        if (idemKey) {
          await finalizeIdempotencyKey(
            "purchase_set",
            `${cleanAccount}:${idemKey}`,
            responsePayload,
            3600
          );
        }
        return responsePayload;
      } catch (txErr) {
        await client.query("ROLLBACK").catch(() => {
        });
        throw txErr;
      } finally {
        client.release();
      }
    }
    return await withAccountMutex(cleanAccount, async () => {
      const key = cleanAccount.toLowerCase();
      const memAcc = memoryAccounts.get(key);
      if (!memAcc) {
        throw new TransactionDomainError(
          "ACCOUNT_NOT_FOUND",
          404,
          "Account not found. Please sign in first."
        );
      }
      const snapshot = structuredClone(memAcc);
      try {
        const stat = memoryMembStat.get(key);
        if (stat && stat.ConnectStat === 1) {
          throw new TransactionDomainError(
            "ACCOUNT_ONLINE_MEMB_STAT",
            409,
            `Rejected by MEMB_STAT Anti-Dupe Guard: Account "${memAcc.loginName}" is currently online (${stat.ServerName}, ConnectStat = 1). Please log out before adding set items.`
          );
        }
        if (memAcc.credits < sanitized.totalCredits) {
          throw new TransactionDomainError(
            "INSUFFICIENT_CREDITS",
            402,
            "You do not have enough credits to do that."
          );
        }
        const simulatedVault = [...memAcc.vaultItems];
        const createdInstances = [];
        const purchasedAt = Math.floor(Date.now() / 1e3);
        for (const mItem of memberItems) {
          const slot = locateFreeWarehouseSlot(simulatedVault, mItem.X, mItem.Y);
          if (slot === 1337 || !verifySlotPlacement(simulatedVault, slot, mItem.X, mItem.Y)) {
            throw new TransactionDomainError(
              "WAREHOUSE_FULL",
              409,
              `You do not have enough free slots in your vault for all pieces of ${group.name} (failed at ${mItem.name}).`
            );
          }
          const serial = generateUniqueItemSerial();
          const lv = mItem.hasLevel === 1 ? sanitized.level : 0;
          const op = mItem.hasOption === 1 ? sanitized.option : 0;
          const lk = mItem.luck === 1 ? sanitized.luck : false;
          const itemHex = encodeSeason6ItemHex({
            itemId: mItem.id,
            itemType: mItem.type,
            level: lv,
            option: op,
            luck: lk,
            skill: false,
            durability: 255,
            serial,
            exlOptions: sanitized.exlOptions,
            ancientStamina: sanitized.ancientStamina,
            fenrirVariant: 0
          });
          const inst = {
            instanceId: `${serial}_${Date.now()}_${mItem.uid}`,
            serial,
            itemHex,
            slotIndex: slot,
            itemUid: mItem.uid,
            itemId: mItem.id,
            itemType: mItem.type,
            name: mItem.name,
            X: mItem.X,
            Y: mItem.Y,
            level: lv,
            option: op,
            luck: lk,
            skill: false,
            exlOptions: sanitized.exlOptions,
            ancientStamina: sanitized.ancientStamina,
            fenrirVariant: 0,
            durability: 255,
            paidCredits: Math.round(
              sanitized.totalCredits / Math.max(1, memberItems.length)
            ),
            canSellBack: false,
            purchasedAt
          };
          simulatedVault.push(inst);
          createdInstances.push(inst);
        }
        memAcc.credits -= sanitized.totalCredits;
        memAcc.vaultItems = simulatedVault;
        await recordAuditLog({
          accountId: memAcc.loginName,
          ipAddress: req.ipAddress,
          action: "PURCHASE_ITEM_SET",
          status: "COMMITTED",
          itemHex: createdInstances.map((i) => i.itemHex).join(","),
          itemSerial: createdInstances[0]?.serial || null,
          creditsDelta: -sanitized.totalCredits,
          idempotencyKey: idemKey || null,
          details: `Bought Set Pack "${group.name}" (${createdInstances.length} items, Serials: ${createdInstances.map((i) => i.serial).join(", ")}) for ${sanitized.totalCredits} credits`
        });
        const responsePayload = {
          ok: true,
          chargedCredits: sanitized.totalCredits,
          chargedWCoinC: 0,
          remainingCredits: memAcc.credits,
          remainingWCoinC: memAcc.wCoinC,
          addedItems: createdInstances,
          warehouseHex3840: encodeWarehouseHex3840(memAcc.vaultItems),
          message: `Successfully added all ${createdInstances.length} pieces of ${group.name} to your warehouse vault!`
        };
        if (idemKey) {
          await finalizeIdempotencyKey(
            "purchase_set",
            `${cleanAccount}:${idemKey}`,
            responsePayload,
            3600
          );
        }
        return responsePayload;
      } catch (innerErr) {
        memoryAccounts.set(key, snapshot);
        throw innerErr;
      }
    });
  } catch (err) {
    if (idemKey) {
      await releaseIdempotencyKey("purchase_set", `${cleanAccount}:${idemKey}`);
    }
    const statusLabel = err instanceof TransactionDomainError ? "REJECTED" : "ROLLED_BACK";
    await recordAuditLog(
      {
        accountId: cleanAccount,
        ipAddress: req.ipAddress,
        action: "PURCHASE_ITEM_SET",
        status: statusLabel,
        idempotencyKey: idemKey || null,
        details: `Set purchase failed (${statusLabel}): ${err instanceof Error ? err.message : String(err)}`
      },
      getPgPool()
    );
    throw err;
  }
}
async function executeRefundVaultItemTx(params) {
  const cleanAccount = (params.accountId || "").trim();
  if (!cleanAccount) {
    throw new TransactionDomainError("INVALID_ACCOUNT", 400, "Account ID is required.");
  }
  try {
    if (pgPool && pgHealthy) {
      const client = await pgPool.connect();
      try {
        await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
        const membRes = await client.query(
          `SELECT "ConnectStat", "ServerName"
           FROM "MEMB_STAT"
           WHERE LOWER("memb___id") = LOWER($1)
           FOR SHARE`,
          [cleanAccount]
        );
        if (membRes.rows[0]?.ConnectStat === 1) {
          throw new TransactionDomainError(
            "ACCOUNT_ONLINE_MEMB_STAT",
            409,
            `Rejected by MEMB_STAT Anti-Dupe Guard: Account "${cleanAccount}" must be offline (ConnectStat = 0) before selling back vault items.`
          );
        }
        const itemRes = await client.query(
          `DELETE FROM webshop_warehouse_items
           WHERE LOWER(account_login) = LOWER($1)
             AND (instance_id = $2 OR serial = $3)
           RETURNING instance_id, serial, item_hex, name, paid_credits, can_sell_back`,
          [cleanAccount, params.instanceId, params.serial.toUpperCase()]
        );
        const removed = itemRes.rows[0];
        if (!removed) {
          throw new TransactionDomainError(
            "ITEM_NOT_IN_VAULT",
            404,
            "Item no longer exists in your warehouse (possible duplicate sellback prevented)."
          );
        }
        const refundCredits = Math.round(
          removed.paid_credits * serverConfig.credits.sellback_Q
        );
        if (!removed.can_sell_back || refundCredits < 1) {
          throw new TransactionDomainError(
            "RESALE_FORBIDDEN",
            403,
            "You are not allowed to resell that item."
          );
        }
        const credRes = await client.query(
          `UPDATE webshop_accounts
           SET credits = credits + $1, updated_at = NOW()
           WHERE LOWER(login_name) = LOWER($2)
           RETURNING credits`,
          [refundCredits, cleanAccount]
        );
        await recordAuditLog(
          {
            accountId: cleanAccount,
            ipAddress: params.ipAddress,
            action: "REFUND_VAULT_ITEM",
            status: "COMMITTED",
            itemHex: removed.item_hex,
            itemSerial: removed.serial,
            creditsDelta: refundCredits,
            details: `Sold back ${removed.name} (Serial: ${removed.serial}) for +${refundCredits} credits`
          },
          client
        );
        await client.query("COMMIT");
        return {
          ok: true,
          refundCredits,
          remainingCredits: credRes.rows[0]?.credits ?? refundCredits,
          message: `Sold back ${removed.name} for +${refundCredits.toLocaleString()} credits!`
        };
      } catch (txErr) {
        await client.query("ROLLBACK").catch(() => {
        });
        throw txErr;
      } finally {
        client.release();
      }
    }
    return await withAccountMutex(cleanAccount, async () => {
      const key = cleanAccount.toLowerCase();
      const memAcc = memoryAccounts.get(key);
      if (!memAcc) {
        throw new TransactionDomainError("ACCOUNT_NOT_FOUND", 404, "Account not found.");
      }
      const snapshot = structuredClone(memAcc);
      try {
        const stat = memoryMembStat.get(key);
        if (stat && stat.ConnectStat === 1) {
          throw new TransactionDomainError(
            "ACCOUNT_ONLINE_MEMB_STAT",
            409,
            `Rejected by MEMB_STAT Anti-Dupe Guard: Account "${memAcc.loginName}" must be offline (ConnectStat = 0) before selling back vault items.`
          );
        }
        const targetIdx = memAcc.vaultItems.findIndex(
          (it) => it.instanceId === params.instanceId || it.serial.toUpperCase() === params.serial.toUpperCase()
        );
        if (targetIdx < 0) {
          throw new TransactionDomainError(
            "ITEM_NOT_IN_VAULT",
            404,
            "Item not found in warehouse."
          );
        }
        const target = memAcc.vaultItems[targetIdx];
        const refundCredits = Math.round(
          target.paidCredits * serverConfig.credits.sellback_Q
        );
        if (!target.canSellBack || refundCredits < 1) {
          throw new TransactionDomainError(
            "RESALE_FORBIDDEN",
            403,
            "You are not allowed to resell that item."
          );
        }
        memAcc.vaultItems.splice(targetIdx, 1);
        memAcc.credits += refundCredits;
        await recordAuditLog({
          accountId: memAcc.loginName,
          ipAddress: params.ipAddress,
          action: "REFUND_VAULT_ITEM",
          status: "COMMITTED",
          itemHex: target.itemHex || encodeSeason6ItemHex(target),
          itemSerial: target.serial,
          creditsDelta: refundCredits,
          details: `Sold back ${target.name} (Serial: ${target.serial}) for +${refundCredits} credits`
        });
        return {
          ok: true,
          refundCredits,
          remainingCredits: memAcc.credits,
          message: `Sold back ${target.name} for +${refundCredits.toLocaleString()} credits!`
        };
      } catch (innerErr) {
        memoryAccounts.set(key, snapshot);
        throw innerErr;
      }
    });
  } catch (err) {
    const statusLabel = err instanceof TransactionDomainError ? "REJECTED" : "ROLLED_BACK";
    await recordAuditLog(
      {
        accountId: cleanAccount,
        ipAddress: params.ipAddress,
        action: "REFUND_VAULT_ITEM",
        status: statusLabel,
        itemSerial: params.serial,
        details: `Refund failed (${statusLabel}): ${err instanceof Error ? err.message : String(err)}`
      },
      getPgPool()
    );
    throw err;
  }
}
async function executePaymentGrantTx(input) {
  const cleanIdem = (input.idempotencyKey || input.reference || "").trim();
  if (!cleanIdem || cleanIdem.length < 4 || cleanIdem.length > 128) {
    throw new TransactionDomainError(
      "INVALID_IDEMPOTENCY_KEY",
      400,
      "Valid Idempotency-Key (4..128 chars) is required."
    );
  }
  const claim = await claimIdempotencyKey("payment_webhook", cleanIdem, 86400);
  if (claim.state === "COMPLETED") {
    const cached = claim.cachedResponse;
    return {
      ...cached,
      status: "AlreadyGranted",
      idempotentReplay: true,
      grant: { ...cached.grant, status: "AlreadyGranted" }
    };
  }
  if (claim.state === "IN_PROGRESS") {
    throw new TransactionDomainError(
      "WEBHOOK_IN_PROGRESS",
      409,
      `Payment transaction with Idempotency-Key "${cleanIdem}" is currently processing.`
    );
  }
  try {
    if (pgPool && pgHealthy) {
      const client = await pgPool.connect();
      try {
        await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
        const existingKey = await client.query(
          `SELECT response_json
           FROM payment_idempotency_keys
           WHERE idempotency_key = $1 OR reference = $2
           LIMIT 1
           FOR SHARE`,
          [cleanIdem, input.reference]
        );
        if (existingKey.rows[0]) {
          await client.query("ROLLBACK");
          const cached = existingKey.rows[0].response_json;
          const replayResult = {
            ...cached,
            status: "AlreadyGranted",
            idempotentReplay: true,
            grant: { ...cached.grant, status: "AlreadyGranted" }
          };
          await finalizeIdempotencyKey("payment_webhook", cleanIdem, replayResult, 86400);
          return replayResult;
        }
        const colMap = {
          WCoinC: "wcoinc",
          WCoinP: "wcoinp",
          GoblinPoints: "goblin_points"
        };
        const targetCol = colMap[input.coinType];
        const updRes = await client.query(
          `UPDATE webshop_accounts
           SET credits = credits + $1,
               ${targetCol} = ${targetCol} + $2,
               updated_at = NOW()
           WHERE LOWER(login_name) = LOWER($3)
           RETURNING login_name, credits, wcoinc, wcoinp, goblin_points`,
          [input.creditsAdded, input.coinAmount, input.loginName.trim()]
        );
        const accRow = updRes.rows[0];
        if (!accRow) {
          throw new TransactionDomainError(
            "ACCOUNT_NOT_FOUND",
            404,
            `Account "${input.loginName.trim()}" does not exist.`
          );
        }
        const grant = {
          id: `grant-${crypto4.randomUUID().slice(0, 8)}`,
          accountLoginName: accRow.login_name,
          coinType: input.coinType,
          amount: input.coinAmount,
          creditsAdded: input.creditsAdded,
          reason: input.reason,
          reference: input.reference,
          idempotencyKey: cleanIdem,
          clientName: input.clientName,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          status: "Created"
        };
        const resultPayload = {
          status: "Created",
          idempotentReplay: false,
          grant,
          balances: {
            credits: accRow.credits,
            wCoinC: accRow.wcoinc,
            wCoinP: accRow.wcoinp,
            goblinPoints: accRow.goblin_points
          }
        };
        await client.query(
          `INSERT INTO payment_idempotency_keys (
            idempotency_key, reference, account_login, coin_type,
            coin_amount, credits_added, reason, client_name, response_json
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            cleanIdem,
            input.reference,
            accRow.login_name,
            input.coinType,
            input.coinAmount,
            input.creditsAdded,
            input.reason,
            input.clientName,
            JSON.stringify(resultPayload)
          ]
        );
        await recordAuditLog(
          {
            accountId: accRow.login_name,
            ipAddress: input.ipAddress,
            action: "PAYMENT_GRANT_CREDITED",
            status: "COMMITTED",
            creditsDelta: input.creditsAdded,
            wCoinCDelta: input.coinType === "WCoinC" ? input.coinAmount : 0,
            idempotencyKey: cleanIdem,
            details: `${input.clientName}: +${input.creditsAdded} Credits & +${input.coinAmount} ${input.coinType} [Ref: ${input.reference}] (${input.reason})`
          },
          client
        );
        await client.query("COMMIT");
        memoryGrantsList.unshift(grant);
        await finalizeIdempotencyKey("payment_webhook", cleanIdem, resultPayload, 86400);
        return resultPayload;
      } catch (txErr) {
        await client.query("ROLLBACK").catch(() => {
        });
        throw txErr;
      } finally {
        client.release();
      }
    }
    return await withAccountMutex(input.loginName, async () => {
      const existingGrant = memoryGrantsByIdempotency.get(cleanIdem) || memoryGrantsByReference.get(input.reference);
      const key = input.loginName.trim().toLowerCase();
      const acc = memoryAccounts.get(key);
      if (!acc) {
        throw new TransactionDomainError(
          "ACCOUNT_NOT_FOUND",
          404,
          `Account "${input.loginName.trim()}" does not exist.`
        );
      }
      if (existingGrant) {
        const replayPayload = {
          status: "AlreadyGranted",
          idempotentReplay: true,
          grant: { ...existingGrant, status: "AlreadyGranted" },
          balances: {
            credits: acc.credits,
            wCoinC: acc.wCoinC,
            wCoinP: acc.wCoinP,
            goblinPoints: acc.goblinPoints
          }
        };
        await finalizeIdempotencyKey("payment_webhook", cleanIdem, replayPayload, 86400);
        return replayPayload;
      }
      const snapshot = structuredClone(acc);
      try {
        acc.credits = Math.max(0, acc.credits + input.creditsAdded);
        if (input.coinType === "WCoinC") {
          acc.wCoinC = Math.max(0, acc.wCoinC + input.coinAmount);
        } else if (input.coinType === "WCoinP") {
          acc.wCoinP = Math.max(0, acc.wCoinP + input.coinAmount);
        } else {
          acc.goblinPoints = Math.max(0, acc.goblinPoints + input.coinAmount);
        }
        const grant = {
          id: `grant-${crypto4.randomUUID().slice(0, 8)}`,
          accountLoginName: acc.loginName,
          coinType: input.coinType,
          amount: input.coinAmount,
          creditsAdded: input.creditsAdded,
          reason: input.reason,
          reference: input.reference,
          idempotencyKey: cleanIdem,
          clientName: input.clientName,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          status: "Created"
        };
        memoryGrantsByIdempotency.set(cleanIdem, grant);
        memoryGrantsByReference.set(input.reference, grant);
        memoryGrantsList.unshift(grant);
        await recordAuditLog({
          accountId: acc.loginName,
          ipAddress: input.ipAddress,
          action: "PAYMENT_GRANT_CREDITED",
          status: "COMMITTED",
          creditsDelta: input.creditsAdded,
          wCoinCDelta: input.coinType === "WCoinC" ? input.coinAmount : 0,
          idempotencyKey: cleanIdem,
          details: `${input.clientName}: +${input.creditsAdded} Credits & +${input.coinAmount} ${input.coinType} [Ref: ${input.reference}] (${input.reason})`
        });
        const resultPayload = {
          status: "Created",
          idempotentReplay: false,
          grant,
          balances: {
            credits: acc.credits,
            wCoinC: acc.wCoinC,
            wCoinP: acc.wCoinP,
            goblinPoints: acc.goblinPoints
          }
        };
        await finalizeIdempotencyKey("payment_webhook", cleanIdem, resultPayload, 86400);
        return resultPayload;
      } catch (innerErr) {
        memoryAccounts.set(key, snapshot);
        throw innerErr;
      }
    });
  } catch (err) {
    await releaseIdempotencyKey("payment_webhook", cleanIdem);
    await recordAuditLog(
      {
        accountId: input.loginName || "unknown",
        ipAddress: input.ipAddress,
        action: "PAYMENT_GRANT_CREDITED",
        status: err instanceof TransactionDomainError ? "REJECTED" : "ROLLED_BACK",
        idempotencyKey: cleanIdem,
        details: `Payment grant failed: ${err instanceof Error ? err.message : String(err)}`
      },
      getPgPool()
    );
    throw err;
  }
}

// src/server/openMuInventoryApi.ts
var OpenMuInventoryApiError = class extends Error {
  constructor(code, retryable, message, status) {
    super(message);
    this.code = code;
    this.retryable = retryable;
    this.status = status;
    this.name = "OpenMuInventoryApiError";
  }
};
function requireConfiguration() {
  const baseUrl = process.env.OPENMU_API_URL?.trim().replace(/\/$/, "");
  const apiKey = process.env.OPENMU_API_KEY?.trim();
  if (!baseUrl || !apiKey) {
    throw new OpenMuInventoryApiError(
      "UNAVAILABLE",
      true,
      "The authoritative OpenMU Inventory API is not configured."
    );
  }
  return { baseUrl, apiKey };
}
function requestSignal(signal) {
  return signal ?? AbortSignal.timeout(Number(process.env.OPENMU_API_TIMEOUT_MS) || 8e3);
}
async function fetchOpenMu(input, init) {
  try {
    return await fetch(input, init);
  } catch (error) {
    throw new OpenMuInventoryApiError(
      "UNAVAILABLE",
      true,
      `The authoritative OpenMU Inventory API could not be reached: ${error instanceof Error ? error.message : "network failure"}`
    );
  }
}
async function getOpenMuCashShopCatalog(signal) {
  const { baseUrl, apiKey } = requireConfiguration();
  const response = await fetchOpenMu(`${baseUrl}/api/cash-shop/catalog`, {
    headers: { "X-Api-Key": apiKey },
    signal: requestSignal(signal)
  });
  if (!response.ok) {
    throw new OpenMuInventoryApiError(
      response.status >= 500 ? "UNAVAILABLE" : "REJECTED",
      response.status >= 500,
      `The authoritative OpenMU catalog request was rejected (${response.status}).`,
      response.status
    );
  }
  return await response.json();
}
async function grantOpenMuInventoryItem(request, signal) {
  const { baseUrl, apiKey } = requireConfiguration();
  const response = await fetchOpenMu(
    `${baseUrl}/api/accounts/${encodeURIComponent(request.loginName)}/cash-shop/item-grants`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey
      },
      body: JSON.stringify({
        packageSequence: request.packageSequence,
        priceSequence: request.priceSequence ?? null,
        reference: request.reference,
        reason: request.reason
      }),
      signal: requestSignal(signal)
    }
  );
  if (response.ok) {
    return await response.json();
  }
  const status = response.status;
  if (status === 404) {
    throw new OpenMuInventoryApiError(
      "ACCOUNT_NOT_FOUND",
      false,
      "The OpenMU account does not exist.",
      status
    );
  }
  if (status === 409) {
    throw new OpenMuInventoryApiError(
      "REFERENCE_CONFLICT",
      false,
      "The order reference conflicts with an existing OpenMU grant.",
      status
    );
  }
  if (status === 422) {
    throw new OpenMuInventoryApiError(
      "INVALID_OFFER",
      false,
      "The mapped OpenMU cash shop offer is unavailable.",
      status
    );
  }
  throw new OpenMuInventoryApiError(
    status >= 500 ? "UNAVAILABLE" : "REJECTED",
    status >= 500,
    `The authoritative OpenMU Inventory API rejected the request (${status}).`,
    status
  );
}

// src/server/security.ts
import crypto5 from "crypto";
var SESSION_COOKIE = "__Host-openmu_shop";
var SESSION_LIFETIME_SECONDS = 60 * 60;
function secret() {
  const value = process.env.SESSION_SECRET ?? "";
  if (value.length < 64) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET must contain at least 64 characters.");
    }
    return "openmu-dev-session-secret-key-at-least-64-characters-long-for-safe-local-development!";
  }
  return value;
}
function signature(payload) {
  return crypto5.createHmac("sha256", secret()).update(payload).digest("base64url");
}
function createSession(loginName, admin) {
  const session = {
    loginName,
    admin,
    csrf: crypto5.randomBytes(24).toString("base64url"),
    expiresAt: Math.floor(Date.now() / 1e3) + SESSION_LIFETIME_SECONDS
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return {
    cookie: `${SESSION_COOKIE}=${payload}.${signature(payload)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_LIFETIME_SECONDS}`,
    csrfToken: session.csrf
  };
}
function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
function readSession(request) {
  const cookie = request.headers.cookie?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  if (!cookie) return null;
  const token = cookie.slice(SESSION_COOKIE.length + 1);
  const [payload, providedSignature] = token.split(".");
  if (!payload || !providedSignature) return null;
  const expected = signature(payload);
  const a = Buffer.from(providedSignature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto5.timingSafeEqual(a, b)) return null;
  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!value.loginName || !value.csrf || value.expiresAt <= Math.floor(Date.now() / 1e3)) return null;
    return value;
  } catch {
    return null;
  }
}
function requireSession(request, response, next) {
  const session = readSession(request);
  if (!session) {
    response.status(401).json({ ok: false, message: "Authentication required." });
    return;
  }
  request.session = session;
  next();
}
function requireCsrf(request, response, next) {
  const expectedOrigin = process.env.PUBLIC_ORIGIN;
  if (expectedOrigin && request.headers.origin && request.headers.origin !== expectedOrigin) {
    response.status(403).json({ ok: false, message: "Invalid request origin." });
    return;
  }
  const token = request.headers["x-csrf-token"];
  if (!request.session || typeof token !== "string") {
    response.status(403).json({ ok: false, message: "CSRF verification failed." });
    return;
  }
  const a = Buffer.from(token);
  const b = Buffer.from(request.session.csrf);
  if (a.length !== b.length || !crypto5.timingSafeEqual(a, b)) {
    response.status(403).json({ ok: false, message: "CSRF verification failed." });
    return;
  }
  next();
}
function requireAdminSession(request, response, next) {
  if (!request.session?.admin) {
    response.status(403).json({ ok: false, message: "Administrator access required." });
    return;
  }
  next();
}
function validateProductionConfiguration() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }
  const required = ["OPENMU_DATABASE_URL", "OPENMU_API_URL", "OPENMU_API_KEY", "PUBLIC_ORIGIN", "SESSION_SECRET"];
  const missing = required.filter((name) => !(process.env[name] ?? "").trim());
  if (missing.length) throw new Error(`Missing required settings: ${missing.join(", ")}`);
  secret();
  if ((process.env.OPENMU_API_KEY ?? "").length < 32) throw new Error("OPENMU_API_KEY must contain at least 32 characters.");
  new URL(process.env.OPENMU_API_URL);
  new URL(process.env.OPENMU_DATABASE_URL);
  const origin = new URL(process.env.PUBLIC_ORIGIN);
  if (origin.protocol !== "https:") throw new Error("PUBLIC_ORIGIN must use HTTPS in production.");
  if (process.env.PAYMENTS_ENABLED === "true" && process.env.PAYPAL_CLIENT_ID && !process.env.PAYPAL_WEBHOOK_ID) throw new Error("PAYPAL_WEBHOOK_ID is required when PayPal is enabled.");
  if (process.env.PAYPAL_USE_SANDBOX === "false" && process.env.PAYPAL_LIVE_ENABLED !== "true") throw new Error("Set PAYPAL_LIVE_ENABLED=true only after completing the sandbox activation gates.");
  if (process.env.TRUEMONEY_ENABLED === "true") throw new Error("TrueMoney must remain disabled until an authenticated provider adapter is implemented.");
  if (process.env.CARDS_ENABLED === "true") throw new Error("Cards must remain disabled until a PCI-compliant hosted-fields adapter is implemented.");
}

// src/server/rateLimiter.ts
function extractClientIp(req) {
  return (req.ip || req.socket.remoteAddress || "0.0.0.0").replace(/^::ffff:/, "");
}
function createDistributedRateLimiter(config) {
  return async (req, res, next) => {
    try {
      const ip = extractClientIp(req);
      let compositeSuffix = ip;
      const { count, resetAtMs } = await incrementRateWindow(
        `${config.prefix}:${compositeSuffix}`,
        config.windowMs
      );
      const remaining = Math.max(0, config.max - count);
      const resetEpochSec = Math.ceil(resetAtMs / 1e3);
      res.setHeader("X-RateLimit-Limit", String(config.max));
      res.setHeader("X-RateLimit-Remaining", String(remaining));
      res.setHeader("X-RateLimit-Reset", String(resetEpochSec));
      if (count > config.max) {
        const retryAfterSeconds = Math.max(1, Math.ceil((resetAtMs - Date.now()) / 1e3));
        res.setHeader("Retry-After", String(retryAfterSeconds));
        res.status(429).json({
          ok: false,
          code: "RATE_LIMIT_EXCEEDED",
          message: config.message,
          retryAfterSeconds
        });
        return;
      }
      next();
    } catch (err) {
      console.error("[RateLimiter] Unexpected error:", err);
      next();
    }
  };
}

// src/server/paypal.ts
import crypto6 from "crypto";
function apiBase() {
  return process.env.PAYPAL_USE_SANDBOX === "false" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}
function credentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID ?? "";
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET ?? "";
  if (!clientId || !clientSecret) throw new Error("PayPal credentials are not configured.");
  return { clientId, clientSecret };
}
async function accessToken() {
  const { clientId, clientSecret } = credentials();
  const response = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });
  if (!response.ok) throw new Error(`PayPal authentication failed (${response.status}).`);
  const body = await response.json();
  if (!body.access_token) throw new Error("PayPal did not return an access token.");
  return body.access_token;
}
async function paypalRequest(path3, init) {
  const token = await accessToken();
  return fetch(`${apiBase()}${path3}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init.headers }
  });
}
async function createPayPalOrder(pkg, loginName) {
  const origin = process.env.PUBLIC_ORIGIN;
  const response = await paypalRequest("/v2/checkout/orders", {
    method: "POST",
    headers: { "PayPal-Request-Id": crypto6.randomUUID() },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        custom_id: `${loginName}|${pkg.code}`,
        invoice_id: `openmu-${crypto6.randomUUID()}`,
        description: `OpenMU credits ${pkg.code}`,
        amount: { currency_code: "THB", value: pkg.priceThb.toFixed(2) }
      }],
      payment_source: { paypal: { experience_context: {
        user_action: "PAY_NOW",
        return_url: `${origin}/api/payments/paypal/complete?packageCode=${encodeURIComponent(pkg.code)}`,
        cancel_url: `${origin}/?payment=cancelled`
      } } }
    })
  });
  const body = await response.json();
  const approvalUrl = body.links?.find((link) => link.rel === "payer-action" || link.rel === "approve")?.href;
  if (!response.ok || !body.id || !approvalUrl) throw new Error(`PayPal order creation failed (${response.status}).`);
  return { orderId: body.id, approvalUrl };
}
async function capturePayPalOrder(orderId) {
  if (!/^[A-Z0-9]{8,32}$/i.test(orderId)) throw new Error("Invalid PayPal order identifier.");
  const response = await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: "POST",
    headers: { "PayPal-Request-Id": `capture-${orderId}` },
    body: "{}"
  });
  const body = await response.json();
  const unit = body.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  const [loginName, packageCode] = String(unit?.custom_id ?? "").split("|");
  if (!response.ok || body.status !== "COMPLETED" || capture?.status !== "COMPLETED" || !capture?.id || !loginName || !packageCode) {
    throw new Error(`PayPal capture was not completed (${response.status}).`);
  }
  return { captureId: capture.id, loginName, packageCode, amount: String(capture.amount?.value ?? ""), currency: String(capture.amount?.currency_code ?? "") };
}
async function verifyPayPalWebhook(headers, event) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;
  const response = await paypalRequest("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: JSON.stringify({
      transmission_id: headers["paypal-transmission-id"],
      transmission_time: headers["paypal-transmission-time"],
      cert_url: headers["paypal-cert-url"],
      auth_algo: headers["paypal-auth-algo"],
      transmission_sig: headers["paypal-transmission-sig"],
      webhook_id: webhookId,
      webhook_event: event
    })
  });
  if (!response.ok) return false;
  const body = await response.json();
  return body.verification_status === "SUCCESS";
}

// src/utils/creditExchange.ts
var CREDIT_EXCHANGE_RATE = 5;
var MIN_CREDIT_EXCHANGE = 100;
var MAX_CREDIT_EXCHANGE = 5e4;
function quoteCreditExchange(value) {
  const credits = Math.trunc(Number(value));
  if (!Number.isFinite(credits) || credits < MIN_CREDIT_EXCHANGE || credits > MAX_CREDIT_EXCHANGE || credits % CREDIT_EXCHANGE_RATE !== 0) {
    return null;
  }
  return { credits, wCoinC: credits / CREDIT_EXCHANGE_RATE };
}

// server.ts
dotenv.config();
var DEFAULT_PROMO_SNAPSHOT = buildDefaultPromotionConfig();
var PAYPAL_PACKAGES = DEFAULT_PROMO_SNAPSHOT.payPalPackages;
var TRUEMONEY_TIERS = DEFAULT_PROMO_SNAPSHOT.trueMoneyTiers;
async function forwardGrantToExternalOpenMu(loginName, coinType, amount, reason, reference) {
  const apiUrl = process.env.OPENMU_API_URL;
  const apiKey = process.env.OPENMU_API_KEY;
  if (!apiUrl || !apiKey) {
    return false;
  }
  try {
    const res = await fetch(
      `${apiUrl.replace(/\/$/, "")}/api/accounts/${encodeURIComponent(
        loginName
      )}/cash-shop/grants`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": apiKey
        },
        body: JSON.stringify({
          coinType,
          amount,
          reason,
          reference
        })
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}
async function startServer() {
  validateProductionConfiguration();
  await initializeDatabaseLayer();
  const app = express();
  const PORT = 3e3;
  app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : false);
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-XSS-Protection", "0");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    if (process.env.NODE_ENV === "production" && process.env.FRAME_PROTECTION === "strict") {
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
    }
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; frame-src 'self'; connect-src 'self' ws: wss: https: https://api-m.sandbox.paypal.com https://api-m.paypal.com; base-uri 'self'; form-action 'self'"
    );
    next();
  });
  app.use(
    express.json({
      limit: "150kb",
      verify: (req, _res, buf) => {
        if (req.originalUrl?.startsWith("/api/webhooks/")) {
          req.rawBody = Buffer.from(buf);
        }
      }
    })
  );
  app.use(express.urlencoded({ extended: true, limit: "100kb" }));
  const apiGeneralLimiter = createDistributedRateLimiter({
    prefix: "api_general",
    windowMs: 60 * 1e3,
    max: 180,
    message: "Too many API requests from your IP. Please slow down (429 Too Many Requests)."
  });
  const purchaseLimiter = createDistributedRateLimiter({
    prefix: "shop_purchase",
    windowMs: 10 * 1e3,
    max: 8,
    includeAccountKey: true,
    message: "Purchase rate limit exceeded (max 8 warehouse transactions per 10s). Anti-flood protection active."
  });
  const authLimiter = createDistributedRateLimiter({
    prefix: "auth_login",
    windowMs: 15 * 60 * 1e3,
    max: 20,
    message: "\u0E21\u0E35\u0E04\u0E33\u0E02\u0E2D\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A\u0E2B\u0E23\u0E37\u0E2D\u0E25\u0E07\u0E17\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19\u0E16\u0E35\u0E48\u0E40\u0E01\u0E34\u0E19\u0E44\u0E1B \u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E2D\u0E2A\u0E31\u0E01\u0E04\u0E23\u0E39\u0E48 (429 Too Many Requests)"
  });
  const paymentLimiter = createDistributedRateLimiter({
    prefix: "payment_gateway",
    windowMs: 5 * 60 * 1e3,
    max: 30,
    includeAccountKey: true,
    message: "\u0E21\u0E35\u0E04\u0E33\u0E02\u0E2D\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19\u0E16\u0E35\u0E48\u0E40\u0E01\u0E34\u0E19\u0E44\u0E1B \u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E2D\u0E2A\u0E31\u0E01\u0E04\u0E23\u0E39\u0E48 (429 Too Many Requests)"
  });
  app.use("/api", apiGeneralLimiter);
  app.use((req, res, next) => {
    const decodedPath = (() => {
      try {
        return decodeURIComponent(req.path);
      } catch {
        return req.path;
      }
    })();
    if (decodedPath.includes("legacy-disabled") || decodedPath.startsWith("/api/openmu/memb-stat")) {
      res.status(404).json({ ok: false, message: "Not found." });
      return;
    }
    next();
  });
  app.use("/api/shop", (req, res, next) => req.method === "GET" && req.path === "/catalog" ? next() : requireSession(req, res, next));
  app.use("/api/accounts", requireSession);
  app.use("/api/accounts/:loginName/cash-shop", (_req, res) => {
    res.status(410).json({ ok: false, message: "Use the authoritative OpenMU CashShop API." });
  });
  app.use("/api/accounts/:loginName", (req, res, next) => {
    const param = (req.params.loginName || "").toLowerCase();
    if (param === "characters" || param === "online-reward") {
      next();
      return;
    }
    if (!req.session?.admin && param !== req.session?.loginName.toLowerCase()) {
      res.status(403).json({ ok: false, message: "Account access denied." });
      return;
    }
    next();
  });
  app.use("/api/payments", requireSession);
  app.use("/api/admin", requireSession, requireAdminSession);
  app.use("/api/shop", (req, res, next) => req.method === "GET" ? next() : requireCsrf(req, res, next));
  app.use("/api/accounts", (req, res, next) => req.method === "GET" ? next() : requireCsrf(req, res, next));
  app.use("/api/payments", (req, res, next) => req.method === "GET" ? next() : requireCsrf(req, res, next));
  app.use("/api/admin", (req, res, next) => req.method === "GET" ? next() : requireCsrf(req, res, next));
  app.use(["/api/shop/purchase-group", "/api/shop/refund"], (_req, res) => {
    res.status(503).json({ ok: false, message: "Direct item delivery is disabled until an authoritative OpenMU inventory API is configured." });
  });
  function requireOpenMuApiKey(req, res, next) {
    const configuredKey = process.env.OPENMU_API_KEY;
    const rawHeader = req.headers["x-api-key"] || req.headers["authorization"];
    const providedKey = typeof rawHeader === "string" ? rawHeader.replace(/^Bearer\s+/i, "").trim() : void 0;
    if (!configuredKey) {
      res.status(503).json({ ok: false, message: "OpenMU API Key is not configured on this server." });
      return;
    }
    if (!providedKey) {
      res.status(401).json({ ok: false, message: "Missing or empty X-Api-Key authentication header." });
      return;
    }
    const providedBuf = Buffer.from(providedKey);
    const expectedBuf = Buffer.from(configuredKey);
    if (providedBuf.length !== expectedBuf.length || !crypto7.timingSafeEqual(providedBuf, expectedBuf)) {
      res.status(403).json({ ok: false, message: "Invalid X-Api-Key credential." });
      return;
    }
    next();
  }
  function getRequesterAccount(req) {
    const session = req.session ?? readSession(req);
    return session ? { loginName: session.loginName } : null;
  }
  function requireAdmin(req, res, next) {
    requireAdminSession(req, res, next);
  }
  app.get("/health/live", (_req, res) => res.json({ status: "ok" }));
  app.get("/health/ready", (_req, res) => {
    const db = getDatabaseHealth();
    const ready = db.postgresConnected && Boolean(process.env.OPENMU_API_URL && process.env.OPENMU_API_KEY);
    res.status(ready ? 200 : 503).json({ status: ready ? "ready" : "unavailable", database: db.mode });
  });
  app.get("/api/health", (_req, res) => {
    const db = getDatabaseHealth();
    const cache = getCacheBackendStatus();
    res.status(db.postgresConnected ? 200 : 503).json({
      ok: db.postgresConnected,
      arch: process.arch,
      platform: process.platform,
      uptimeSeconds: Math.floor(process.uptime()),
      database: db,
      cache,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.get("/api/shop/catalog", async (_req, res, next) => {
    try {
      const { bundle, cacheHit } = await getCatalogBundleCached();
      const cacheStatus = getCacheBackendStatus();
      res.setHeader("X-Cache", cacheHit ? "HIT" : "MISS");
      res.setHeader("X-Cache-Backend", cacheStatus.backend);
      res.setHeader("Cache-Control", "public, max-age=15, stale-while-revalidate=60");
      res.json({
        ok: true,
        cacheHit,
        cacheBackend: cacheStatus.backend,
        ...bundle
      });
    } catch (err) {
      next(err);
    }
  });
  app.get("/api/openmu/memb-stat/:loginName", requireSession, async (req, res, next) => {
    try {
      const target = (req.params.loginName || "").trim();
      if (!req.session?.admin && target.toLowerCase() !== req.session?.loginName.toLowerCase()) {
        res.status(403).json({ ok: false, message: "Account access denied." });
        return;
      }
      const row = await queryMembStatOnlineStatus(target);
      res.json({ ok: true, membStat: row });
    } catch (err) {
      next(err);
    }
  });
  app.post("/api/openmu/memb-stat", requireSession, requireAdminSession, requireCsrf, async (req, res, next) => {
    try {
      const { loginName, connectStat, serverName } = req.body;
      if (!loginName || !loginName.trim()) {
        res.status(400).json({ ok: false, message: "loginName is required." });
        return;
      }
      const normalizedStat = connectStat === 1 || connectStat === true ? 1 : 0;
      const clientIp = extractClientIp(req);
      const row = await setMembStatConnectionState(
        loginName.trim(),
        normalizedStat,
        clientIp,
        serverName || "Continent-of-Lorencia-1"
      );
      await recordAuditLog(
        {
          accountId: loginName.trim(),
          ipAddress: clientIp,
          action: "MEMB_STAT_SYNC",
          status: "COMMITTED",
          details: `MEMB_STAT ConnectStat updated to ${normalizedStat} (${normalizedStat === 1 ? "ONLINE" : "OFFLINE"}) on ${row.ServerName}`
        },
        getPgPool()
      );
      res.json({ ok: true, membStat: row });
    } catch (err) {
      next(err);
    }
  });
  app.post("/api/shop/purchase", purchaseLimiter, async (req, res, next) => {
    try {
      const clientIp = extractClientIp(req);
      const headerIdem = req.headers["idempotency-key"];
      const body = req.body;
      const idempotencyKey = typeof headerIdem === "string" && headerIdem.trim() ? headerIdem.trim() : body.idempotencyKey;
      if (!idempotencyKey || body.currency === "WCoinC") {
        throw new TransactionDomainError(
          body.currency === "WCoinC" ? "WCOIN_PURCHASE_NOT_AUTHORITATIVE" : "IDEMPOTENCY_KEY_REQUIRED",
          422,
          body.currency === "WCoinC" ? "WCoin purchases remain disabled until OpenMU can debit WCoin and deliver the item atomically." : "Idempotency-Key is required."
        );
      }
      if (Number(body.level) !== 0 || Number(body.option) !== 0 || Boolean(body.luck) || Boolean(body.skill) || Array.isArray(body.exlOptions) && body.exlOptions.some(Boolean) || body.ancientStamina === 5 || body.ancientStamina === 10 || body.fenrirVariant === 1 || body.fenrirVariant === 2 || body.fenrirVariant === 3) {
        throw new TransactionDomainError(
          "CLIENT_ITEM_OPTIONS_REJECTED",
          422,
          "Item options are controlled by the authoritative OpenMU offer and cannot be selected by the browser."
        );
      }
      const reference = `webshop:order:${idempotencyKey}`;
      const order = await reserveAuthoritativeItemOrder({
        accountLogin: req.session?.loginName || "",
        itemUid: Number(body.itemUid),
        reference
      });
      if (order.status === "delivered") {
        res.json({
          ok: true,
          idempotentReplay: true,
          orderStatus: order.status,
          reference,
          chargedCredits: order.chargedCredits,
          chargedWCoinC: 0,
          remainingCredits: order.remainingCredits,
          remainingWCoinC: 0,
          addedItems: [],
          message: "The item was already delivered to your in-game Cash Shop storage."
        });
        return;
      }
      if (order.status !== "pending") {
        throw new TransactionDomainError(
          "ORDER_REQUIRES_REVIEW",
          409,
          `Order ${reference} is ${order.status} and cannot be submitted again.`
        );
      }
      try {
        const grant = await grantOpenMuInventoryItem({
          loginName: order.accountLogin,
          packageSequence: order.packageSequence,
          priceSequence: order.priceSequence,
          reference,
          reason: `WebShop Credits purchase, item UID ${order.itemUid}`
        });
        await completeAuthoritativeItemOrder(reference, grant.id);
        await recordAuditLog(
          {
            accountId: order.accountLogin,
            ipAddress: clientIp,
            action: "AUTHORITATIVE_ITEM_PURCHASE",
            status: "COMMITTED",
            creditsDelta: -order.chargedCredits,
            idempotencyKey,
            details: `Delivered OpenMU package ${order.packageSequence}, price ${order.priceSequence ?? "bundle"}, grant ${grant.id}, reference ${reference}`
          },
          getPgPool()
        );
        res.status(201).json({
          ok: true,
          orderStatus: "delivered",
          reference,
          openMuGrantId: grant.id,
          chargedCredits: order.chargedCredits,
          chargedWCoinC: 0,
          remainingCredits: order.remainingCredits,
          remainingWCoinC: 0,
          addedItems: [],
          message: "Item delivered to your in-game Cash Shop storage."
        });
      } catch (error) {
        if (!(error instanceof OpenMuInventoryApiError)) throw error;
        if (error.retryable) {
          res.status(503).json({
            ok: false,
            pending: true,
            reference,
            idempotencyKey,
            remainingCredits: order.remainingCredits,
            message: "Delivery is pending. Retry the same purchase; do not create a new order."
          });
          return;
        }
        const refund = error.code !== "REFERENCE_CONFLICT";
        await failAuthoritativeItemOrder(reference, error.code, refund);
        throw new TransactionDomainError(
          error.code,
          error.status || 409,
          refund ? `${error.message} Reserved credits were returned.` : `${error.message} The order requires manual review; credits were not changed again.`
        );
      }
    } catch (err) {
      next(err);
    }
  });
  app.post("/api/shop/purchase-group", purchaseLimiter, async (req, res, next) => {
    try {
      const clientIp = extractClientIp(req);
      const headerIdem = req.headers["idempotency-key"];
      const body = req.body;
      const idempotencyKey = typeof headerIdem === "string" && headerIdem.trim() ? headerIdem.trim() : body.idempotencyKey;
      const result = await executePurchaseGroupSetTx({
        accountId: req.session?.loginName || "",
        ipAddress: clientIp,
        idempotencyKey,
        groupId: Number(body.groupId),
        level: Number(body.level) || 0,
        option: Number(body.option) || 0,
        luck: Boolean(body.luck),
        exlOptions: Array.isArray(body.exlOptions) ? body.exlOptions : [],
        ancientStamina: body.ancientStamina === 5 || body.ancientStamina === 10 ? body.ancientStamina : 0
      });
      res.status(result.idempotentReplay ? 200 : 201).json(result);
    } catch (err) {
      next(err);
    }
  });
  app.post("/api/shop/refund", purchaseLimiter, async (req, res, next) => {
    try {
      const clientIp = extractClientIp(req);
      const body = req.body;
      const result = await executeRefundVaultItemTx({
        accountId: req.session?.loginName || "",
        ipAddress: clientIp,
        instanceId: body.instanceId || "",
        serial: body.serial || ""
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  });
  app.post("/api/webhooks/paypal", paymentLimiter, async (req, res) => {
    try {
      const headers = Object.fromEntries(Object.entries(req.headers).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]));
      if (!await verifyPayPalWebhook(headers, req.body)) {
        res.status(401).json({ ok: false });
        return;
      }
      const event = req.body;
      if (event.event_type !== "PAYMENT.CAPTURE.COMPLETED") {
        res.status(204).end();
        return;
      }
      const resource = event.resource;
      const [loginName, packageCode] = String(resource?.custom_id ?? "").split("|");
      const pkg = getEffectivePromotions().effectivePayPalPackages.find((candidate) => candidate.code === packageCode);
      if (!pkg || resource?.status !== "COMPLETED" || resource?.amount?.currency_code !== "THB" || String(resource?.amount?.value) !== pkg.priceThb.toFixed(2) || !resource?.id || !loginName) {
        res.status(400).json({ ok: false });
        return;
      }
      const reference = `paypal:${resource.id}`;
      const reason = `PayPal ${pkg.code}`;
      const granted = pkg.wCoinC === 0 || await forwardGrantToExternalOpenMu(loginName, "WCoinC", pkg.wCoinC, reason, reference);
      if (!granted) {
        res.status(503).json({ ok: false });
        return;
      }
      await executePaymentGrantTx({ idempotencyKey: reference, loginName, ipAddress: extractClientIp(req), coinType: "WCoinC", coinAmount: pkg.wCoinC, creditsAdded: pkg.credits, reason, reference, clientName: "PayPal" });
      res.status(204).end();
    } catch (error) {
      console.error("[PayPal webhook]", error instanceof Error ? error.message : error);
      res.status(503).json({ ok: false });
    }
  });
  app.post("/api/webhooks/payment", (_req, res) => {
    res.status(410).json({ ok: false, message: "Generic payment webhooks are disabled. Use a verified provider-specific endpoint." });
  });
  app.get("/api/openmu/status", (_req, res) => {
    const hasExternalApi = Boolean(process.env.OPENMU_API_URL) && !process.env.OPENMU_API_URL?.includes("localhost:5000");
    const hasPayPalKeys = Boolean(
      process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET
    );
    const dbHealth = getDatabaseHealth();
    const cacheHealth = getCacheBackendStatus();
    const {
      config: promoConfig,
      effectiveTrueMoneyTiers,
      effectivePayPalPackages
    } = getEffectivePromotions();
    res.json({
      connectedMode: hasExternalApi ? "Live OpenMU-Origins Remote API" : dbHealth.postgresConnected ? "PostgreSQL SERIALIZABLE ACID + Redis Cache" : "OpenMU-Origins Embedded ACID Bridge",
      openMuApiUrl: process.env.OPENMU_API_URL || "http://localhost:5000",
      merchantPhone: promoConfig.merchantPhone || process.env.TRUEMONEY_MERCHANT_PHONE || "",
      payPalSandbox: process.env.PAYPAL_USE_SANDBOX !== "false",
      hasLivePayPalCredentials: hasPayPalKeys,
      database: dbHealth,
      cache: cacheHealth,
      promotionConfig: promoConfig,
      packages: effectivePayPalPackages,
      trueMoneyTiers: effectiveTrueMoneyTiers,
      paymentProviders: {
        trueMoney: process.env.PAYMENTS_ENABLED === "true" && process.env.TRUEMONEY_ENABLED === "true" ? "configured" : "disabled",
        payPal: process.env.PAYMENTS_ENABLED === "true" && Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) ? "configured" : "disabled",
        cards: process.env.PAYMENTS_ENABLED === "true" && process.env.CARDS_ENABLED === "true" ? "configured" : "disabled"
      }
    });
  });
  app.get("/api/payments/promotions", (_req, res) => {
    const {
      config: promoConfig,
      effectiveTrueMoneyTiers,
      effectivePayPalPackages
    } = getEffectivePromotions();
    res.json({
      ok: true,
      promotionConfig: promoConfig,
      trueMoneyTiers: effectiveTrueMoneyTiers,
      packages: effectivePayPalPackages
    });
  });
  app.post("/api/payments/credits/exchange", paymentLimiter, async (req, res, next) => {
    try {
      if (!req.session) {
        res.status(401).json({ ok: false });
        return;
      }
      const quote = quoteCreditExchange(req.body?.credits);
      const idempotencyKey = String(req.headers["idempotency-key"] ?? "").trim();
      if (!/^[a-zA-Z0-9:_-]{16,128}$/.test(idempotencyKey)) {
        res.status(400).json({ ok: false, message: "A valid Idempotency-Key header is required." });
        return;
      }
      if (!quote) {
        res.status(400).json({ ok: false, message: "Exchange 100-50,000 credits in multiples of 5." });
        return;
      }
      const { credits, wCoinC } = quote;
      const status = await reserveCreditExchange(req.session.loginName, credits, wCoinC, idempotencyKey);
      if (status === "completed") {
        const wallet2 = await getOpenMuAccountSummary(req.session.loginName);
        res.json({ ok: true, idempotentReplay: true, creditsSpent: credits, wCoinC, wallet: wallet2 });
        return;
      }
      const reference = `credit-exchange:${idempotencyKey}`;
      const granted = await forwardGrantToExternalOpenMu(req.session.loginName, "WCoinC", wCoinC, "WebShop credit exchange", reference);
      if (!granted) {
        res.status(503).json({ ok: false, pending: true, idempotencyKey, message: "Exchange is reserved and awaiting the OpenMU server. Retry this pending exchange." });
        return;
      }
      await completeCreditExchange(idempotencyKey);
      const wallet = await getOpenMuAccountSummary(req.session.loginName);
      res.status(201).json({ ok: true, creditsSpent: credits, wCoinC, wallet });
    } catch (error) {
      next(error);
    }
  });
  app.post("/api/openmu/login", authLimiter, async (req, res, next) => {
    try {
      const {
        loginName,
        password
      } = req.body;
      const clientIp = extractClientIp(req);
      if (!loginName || !loginName.trim()) {
        res.status(400).json({ ok: false, message: "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E0A\u0E37\u0E48\u0E2D\u0E1A\u0E31\u0E0D\u0E0A\u0E35 (LoginName)" });
        return;
      }
      if (!password) {
        res.status(400).json({ ok: false, message: "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19 (Password)" });
        return;
      }
      const cleanName = loginName.trim();
      const acc = await authenticateOpenMuAccount(cleanName, password);
      if (!acc) {
        await recordAuditLog(
          {
            accountId: cleanName,
            ipAddress: clientIp,
            action: "AUTH_LOGIN_FAILED",
            status: "REJECTED",
            details: `Failed login attempt for "${cleanName}"`
          },
          getPgPool()
        );
        res.status(401).json({
          ok: false,
          message: "\u0E0A\u0E37\u0E48\u0E2D\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E2B\u0E23\u0E37\u0E2D\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 (Invalid credentials)"
        });
        return;
      }
      if (acc.state !== 0) {
        res.status(403).json({
          ok: false,
          message: `\u0E1A\u0E31\u0E0D\u0E0A\u0E35 ${acc.loginName} \u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E40\u0E02\u0E49\u0E32 WebShop \u0E44\u0E14\u0E49\u0E43\u0E19\u0E02\u0E13\u0E30\u0E19\u0E35\u0E49`
        });
        return;
      }
      const isAdmin = Boolean(acc.isAdmin);
      const session = createSession(acc.loginName, isAdmin);
      await recordAuditLog(
        {
          accountId: acc.loginName,
          ipAddress: clientIp,
          action: "AUTH_LOGIN_SUCCESS",
          status: "COMMITTED",
          details: "Authenticated session established"
        },
        getPgPool()
      );
      res.setHeader("Set-Cookie", session.cookie);
      res.json({
        ok: true,
        csrfToken: session.csrfToken,
        account: {
          id: acc.id,
          loginName: acc.loginName,
          email: acc.email,
          state: acc.state,
          role: isAdmin ? "ADMIN" : "USER",
          isMasterAdmin: isAdmin,
          credits: acc.credits,
          vaultMoney: acc.vaultMoney,
          onlineMinutes: acc.onlineMinutes,
          exchangedOnlineHours: acc.exchangedOnlineHours,
          vipUntil: acc.vipUntil,
          vaultItems: [],
          wCoinC: acc.wCoinC,
          wCoinP: acc.wCoinP,
          goblinPoints: acc.goblinPoints,
          isAdmin
        }
      });
    } catch (err) {
      next(err);
    }
  });
  app.post("/api/openmu/logout", requireSession, requireCsrf, (_req, res) => {
    res.setHeader("Set-Cookie", clearSessionCookie());
    res.json({ ok: true });
  });
  app.get("/api/openmu/session", async (req, res) => {
    const session = readSession(req);
    if (!session) {
      res.status(401).json({ ok: false });
      return;
    }
    const account = await getOpenMuAccountSummary(session.loginName);
    if (!account) {
      res.setHeader("Set-Cookie", clearSessionCookie());
      res.status(401).json({ ok: false });
      return;
    }
    const isAdmin = Boolean(session.admin || account.isAdmin);
    res.json({ ok: true, csrfToken: session.csrf, account: {
      id: account.id,
      loginName: account.loginName,
      email: account.email,
      state: account.state,
      role: isAdmin ? "ADMIN" : "USER",
      isAdmin,
      isMasterAdmin: isAdmin,
      credits: account.credits,
      vaultMoney: account.vaultMoney,
      onlineMinutes: account.onlineMinutes,
      exchangedOnlineHours: account.exchangedOnlineHours,
      vipUntil: account.vipUntil,
      vaultItems: [],
      wCoinC: account.wCoinC,
      wCoinP: account.wCoinP,
      goblinPoints: account.goblinPoints
    } });
  });
  app.get("/api/accounts/characters", async (req, res, next) => {
    try {
      if (!req.session) {
        res.status(401).json({ ok: false, message: "Authentication required." });
        return;
      }
      const characters = await getAccountCharacters(req.session.loginName);
      res.json({ ok: true, characters });
    } catch (err) {
      next(err);
    }
  });
  app.post(
    "/api/accounts/online-reward/redeem",
    purchaseLimiter,
    async (req, res, next) => {
      try {
        if (!req.session) {
          res.status(401).json({ ok: false, message: "Authentication required." });
          return;
        }
        const hoursToRedeem = Number(req.body?.hoursToRedeem);
        const result = await redeemAccountOnlineHours({
          loginName: req.session.loginName,
          hoursToRedeem,
          ipAddress: extractClientIp(req)
        });
        res.json(result);
      } catch (err) {
        next(err);
      }
    }
  );
  app.post(
    "/api/accounts/characters/buy-400",
    purchaseLimiter,
    async (req, res, next) => {
      try {
        if (!req.session) {
          res.status(401).json({ ok: false, message: "Authentication required." });
          return;
        }
        const { characterName, classCode } = req.body;
        const result = await buyCharacter400Tx({
          loginName: req.session.loginName,
          characterName: characterName || "",
          classCode: classCode || "bm",
          ipAddress: extractClientIp(req)
        });
        res.status(201).json(result);
      } catch (err) {
        next(err);
      }
    }
  );
  app.post(
    "/api/accounts/characters/delete-400",
    purchaseLimiter,
    async (req, res, next) => {
      try {
        if (!req.session) {
          res.status(401).json({ ok: false, message: "Authentication required." });
          return;
        }
        const { characterName, deleteCode } = req.body;
        const result = await deleteCharacter400ForCredits({
          loginName: req.session.loginName,
          characterName: characterName || "",
          deleteCode: deleteCode || "",
          ipAddress: extractClientIp(req)
        });
        res.json(result);
      } catch (err) {
        next(err);
      }
    }
  );
  app.post(
    "/api/accounts/:loginName/cash-shop/grants",
    requireOpenMuApiKey,
    async (req, res, next) => {
      try {
        const loginName = (req.params.loginName || "").trim();
        const clientIp = extractClientIp(req);
        const headerIdem = req.headers["idempotency-key"];
        const { coinType = "WCoinC", amount, reason, reference } = req.body;
        if (!/^[a-zA-Z0-9_-]{3,20}$/.test(loginName)) {
          res.status(400).json({ ok: false, message: "Invalid login name format." });
          return;
        }
        if (!["WCoinC", "WCoinP", "GoblinPoints"].includes(coinType)) {
          res.status(400).json({ ok: false, message: "Invalid coinType parameter." });
          return;
        }
        if (typeof amount !== "number" || !Number.isInteger(amount) || amount <= 0 || amount > 5e5) {
          res.status(400).json({
            ok: false,
            message: "The amount must be a positive integer between 1 and 500,000."
          });
          return;
        }
        const ref = reference ? reference.trim() : `manual:${crypto7.randomUUID().slice(0, 10)}`;
        const idemKey = typeof headerIdem === "string" && headerIdem.trim() ? headerIdem.trim() : ref;
        const creditsAdded = Math.max(0, amount * 4);
        const txResult = await executePaymentGrantTx({
          idempotencyKey: idemKey,
          loginName,
          ipAddress: clientIp,
          coinType,
          coinAmount: amount,
          creditsAdded,
          reason: reason ? reason.trim().slice(0, 120) : "Direct API CashShop Grant",
          reference: ref,
          clientName: "OpenMU.ApiKey"
        });
        if (!txResult.idempotentReplay) {
          await forwardGrantToExternalOpenMu(
            loginName,
            coinType,
            amount,
            reason || "Direct API CashShop Grant",
            ref
          );
        }
        res.status(txResult.status === "Created" ? 201 : 200).json({
          ok: true,
          status: txResult.status,
          idempotentReplay: txResult.idempotentReplay,
          grant: txResult.grant,
          balances: {
            wCoinC: txResult.balances.wCoinC,
            wCoinP: txResult.balances.wCoinP,
            goblinPoints: txResult.balances.goblinPoints
          }
        });
      } catch (err) {
        next(err);
      }
    }
  );
  app.post("/api/payments/truemoney/redeem", (_req, res) => {
    res.status(503).json({ ok: false, message: "TrueMoney is not connected. No credit has been granted." });
  });
  app.post("/api/payments/paypal/create-order", paymentLimiter, async (req, res, next) => {
    try {
      if (process.env.PAYMENTS_ENABLED !== "true" || !process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
        res.status(503).json({ ok: false, message: "PayPal checkout is not configured." });
        return;
      }
      const { packageCode } = req.body;
      const pkg = getEffectivePromotions().effectivePayPalPackages.find((candidate) => candidate.code === packageCode);
      if (!pkg || !req.session) {
        res.status(400).json({ ok: false, message: "Invalid package." });
        return;
      }
      const order = await createPayPalOrder(pkg, req.session.loginName);
      res.status(201).json({ ok: true, orderToken: order.orderId, approvalUrl: order.approvalUrl, package: pkg });
    } catch (error) {
      next(error);
    }
  });
  app.post("/api/payments/paypal/capture-order", (_req, res) => {
    res.status(503).json({ ok: false, message: "PayPal capture is disabled. No credit has been granted." });
  });
  app.get("/api/payments/paypal/complete", async (req, res) => {
    try {
      if (!req.session) {
        res.redirect("/?payment=login-required");
        return;
      }
      const orderId = typeof req.query.token === "string" ? req.query.token : "";
      const requestedPackage = typeof req.query.packageCode === "string" ? req.query.packageCode : "";
      const capture = await capturePayPalOrder(orderId);
      const pkg = getEffectivePromotions().effectivePayPalPackages.find((candidate) => candidate.code === capture.packageCode);
      if (!pkg || pkg.code !== requestedPackage || capture.loginName.toLowerCase() !== req.session.loginName.toLowerCase() || capture.currency !== "THB" || capture.amount !== pkg.priceThb.toFixed(2)) {
        res.redirect("/?payment=invalid");
        return;
      }
      const reference = `paypal:${capture.captureId}`;
      const reason = `PayPal ${pkg.code}`;
      const granted = pkg.wCoinC === 0 || await forwardGrantToExternalOpenMu(capture.loginName, "WCoinC", pkg.wCoinC, reason, reference);
      if (!granted) {
        res.redirect("/?payment=grant-pending");
        return;
      }
      await executePaymentGrantTx({
        idempotencyKey: reference,
        loginName: capture.loginName,
        ipAddress: extractClientIp(req),
        coinType: "WCoinC",
        coinAmount: pkg.wCoinC,
        creditsAdded: pkg.credits,
        reason,
        reference,
        clientName: "PayPal"
      });
      res.redirect("/?payment=approved");
    } catch (error) {
      console.error("[PayPal completion]", error instanceof Error ? error.message : error);
      res.redirect("/?payment=invalid");
    }
  });
  app.get("/api/admin/accounts", requireAdmin, async (req, res, next) => {
    try {
      const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 250));
      const accounts = await listAdminAccounts(limit);
      res.json({ ok: true, count: accounts.length, accounts });
    } catch (err) {
      next(err);
    }
  });
  app.post("/api/admin/accounts/adjust-balance", requireAdmin, async (req, res, next) => {
    try {
      const adminAcc = getRequesterAccount(req);
      const clientIp = extractClientIp(req);
      const { username, creditsDelta, vaultZenDelta } = req.body;
      const updated = await adminAdjustAccountBalance({
        targetLoginName: username || "",
        creditsDelta: typeof creditsDelta === "number" ? creditsDelta : void 0,
        vaultZenDelta: typeof vaultZenDelta === "number" ? vaultZenDelta : void 0,
        adminLoginName: adminAcc?.loginName || "admin",
        ipAddress: clientIp
      });
      res.json({
        ok: true,
        account: updated
      });
    } catch (err) {
      next(err);
    }
  });
  app.get("/api/admin/audit-logs", requireAdmin, (req, res) => {
    const limit = Number(req.query.limit) || 200;
    const accountFilter = typeof req.query.account === "string" ? req.query.account : void 0;
    const entries = getRecentAuditLogs(limit, accountFilter);
    res.json({ ok: true, count: entries.length, logs: entries });
  });
  app.post("/api/admin/catalog/items", requireAdmin, async (req, res, next) => {
    try {
      const item = req.body?.item;
      if (!item || !Number.isInteger(item.uid) || !item.name || !Number.isInteger(item.credits) || item.credits < 0) {
        res.status(400).json({ ok: false, message: "Valid WebShopItem payload required." });
        return;
      }
      if (item.openMuPackageSequence !== void 0) {
        if (!Number.isInteger(item.openMuPackageSequence) || item.openMuPackageSequence < 0) {
          throw new TransactionDomainError("INVALID_OPENMU_MAPPING", 422, "OpenMU package sequence must be a non-negative integer.");
        }
        const catalog = await getOpenMuCashShopCatalog();
        const offer = catalog.find((entry) => entry.packageSequence === item.openMuPackageSequence);
        if (!offer) {
          throw new TransactionDomainError("INVALID_OPENMU_MAPPING", 422, "The OpenMU package is not enabled in the authoritative catalog.");
        }
        if (offer.isBundle) {
          if (item.openMuPriceSequence !== void 0 && item.openMuPriceSequence !== null) {
            throw new TransactionDomainError("INVALID_OPENMU_MAPPING", 422, "An OpenMU bundle must not specify a price sequence.");
          }
          item.openMuPriceSequence = null;
        } else {
          if (!Number.isInteger(item.openMuPriceSequence)) {
            throw new TransactionDomainError("INVALID_OPENMU_MAPPING", 422, "A non-bundle OpenMU package requires a price sequence.");
          }
          const product = offer.products.find((entry) => entry.priceSequence === item.openMuPriceSequence);
          if (!product || product.itemGroup !== item.type || product.itemNumber !== item.id) {
            throw new TransactionDomainError("INVALID_OPENMU_MAPPING", 422, "The OpenMU product does not match this WebShop item type and number.");
          }
        }
      } else {
        delete item.openMuPriceSequence;
      }
      const saved = await upsertCatalogItem(item);
      const adminAcc = getRequesterAccount(req);
      await recordAuditLog(
        {
          accountId: adminAcc?.loginName || "admin",
          ipAddress: extractClientIp(req),
          action: "ADMIN_CATALOG_UPSERT_ITEM",
          status: "COMMITTED",
          details: `Upserted catalog item UID #${saved.uid} (${saved.name}, ${saved.credits} Cr) & invalidated Redis catalog cache`
        },
        getPgPool()
      );
      res.json({ ok: true, item: saved });
    } catch (err) {
      next(err);
    }
  });
  app.delete("/api/admin/catalog/items/:uid", requireAdmin, async (req, res, next) => {
    try {
      const uid = Number(req.params.uid);
      const removed = await deleteCatalogItem(uid);
      const adminAcc = getRequesterAccount(req);
      await recordAuditLog(
        {
          accountId: adminAcc?.loginName || "admin",
          ipAddress: extractClientIp(req),
          action: "ADMIN_CATALOG_DELETE_ITEM",
          status: "COMMITTED",
          details: `Deleted catalog item UID #${uid} & invalidated Redis catalog cache`
        },
        getPgPool()
      );
      res.json({ ok: true, removed });
    } catch (err) {
      next(err);
    }
  });
  app.post("/api/admin/catalog/groups", requireAdmin, async (req, res, next) => {
    try {
      const group = req.body?.group;
      if (!group || typeof group.id !== "number" || !group.name) {
        res.status(400).json({ ok: false, message: "Valid ItemGroup payload required." });
        return;
      }
      const saved = await upsertCatalogGroup(group);
      const adminAcc = getRequesterAccount(req);
      await recordAuditLog(
        {
          accountId: adminAcc?.loginName || "admin",
          ipAddress: extractClientIp(req),
          action: "ADMIN_CATALOG_UPSERT_GROUP",
          status: "COMMITTED",
          details: `Upserted item group #${saved.id} (${saved.name}, ${saved.credits} Cr) & invalidated Redis catalog cache`
        },
        getPgPool()
      );
      res.json({ ok: true, group: saved });
    } catch (err) {
      next(err);
    }
  });
  app.delete("/api/admin/catalog/groups/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const removed = await deleteCatalogGroup(id);
      const adminAcc = getRequesterAccount(req);
      await recordAuditLog(
        {
          accountId: adminAcc?.loginName || "admin",
          ipAddress: extractClientIp(req),
          action: "ADMIN_CATALOG_DELETE_GROUP",
          status: "COMMITTED",
          details: `Deleted item group #${id} & invalidated Redis catalog cache`
        },
        getPgPool()
      );
      res.json({ ok: true, removed });
    } catch (err) {
      next(err);
    }
  });
  app.post("/api/admin/catalog/invalidate", requireAdmin, async (_req, res, next) => {
    try {
      await invalidateCatalogCache();
      res.json({ ok: true, message: "Catalog Redis cache invalidated." });
    } catch (err) {
      next(err);
    }
  });
  app.get("/api/admin/promotions", requireAdmin, (_req, res) => {
    const config = getPromotionConfig();
    const { effectiveTrueMoneyTiers, effectivePayPalPackages } = getEffectivePromotions();
    res.json({
      ok: true,
      promotionConfig: config,
      effectiveTrueMoneyTiers,
      effectivePayPalPackages
    });
  });
  app.put("/api/admin/promotions", requireAdmin, async (req, res, next) => {
    try {
      const adminAcc = getRequesterAccount(req);
      const patch = req.body?.promotionConfig || req.body;
      if (!patch || typeof patch !== "object") {
        res.status(400).json({ ok: false, message: "Valid promotionConfig payload is required." });
        return;
      }
      const saved = await updatePromotionConfig(
        patch,
        adminAcc?.loginName || "admin"
      );
      const { effectiveTrueMoneyTiers, effectivePayPalPackages } = getEffectivePromotions();
      await recordAuditLog(
        {
          accountId: adminAcc?.loginName || "admin",
          ipAddress: extractClientIp(req),
          action: "ADMIN_PROMOTION_UPDATE",
          status: "COMMITTED",
          details: `Updated Top-Up Promotions (${saved.trueMoneyTiers.length} TrueMoney tiers, ${saved.payPalPackages.length} PayPal packages, Campaign=${saved.campaignActive ? `ON (+${saved.extraBonusPercent}%)` : "OFF"}, Base=${saved.baseCreditsPerThb} Cr/THB & ${saved.baseWCoinCPerThb} WCoinC/THB)`
        },
        getPgPool()
      );
      res.json({
        ok: true,
        message: "\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E01\u0E32\u0E23\u0E15\u0E31\u0E49\u0E07\u0E04\u0E48\u0E32\u0E42\u0E1B\u0E23\u0E42\u0E21\u0E0A\u0E31\u0E48\u0E19 TrueMoney & PayPal \u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08",
        promotionConfig: saved,
        effectiveTrueMoneyTiers,
        effectivePayPalPackages
      });
    } catch (err) {
      next(err);
    }
  });
  app.post("/api/admin/promotions/reset", requireAdmin, async (req, res, next) => {
    try {
      const adminAcc = getRequesterAccount(req);
      const reset = await resetPromotionConfigToDefault(
        adminAcc?.loginName || "admin"
      );
      const { effectiveTrueMoneyTiers, effectivePayPalPackages } = getEffectivePromotions();
      await recordAuditLog(
        {
          accountId: adminAcc?.loginName || "admin",
          ipAddress: extractClientIp(req),
          action: "ADMIN_PROMOTION_RESET",
          status: "COMMITTED",
          details: "Reset TrueMoney & PayPal promotion tiers to harmonized Egis-MU defaults"
        },
        getPgPool()
      );
      res.json({
        ok: true,
        message: "\u0E23\u0E35\u0E40\u0E0B\u0E47\u0E15\u0E42\u0E1B\u0E23\u0E42\u0E21\u0E0A\u0E31\u0E48\u0E19\u0E01\u0E25\u0E31\u0E1A\u0E40\u0E1B\u0E47\u0E19\u0E04\u0E48\u0E32\u0E21\u0E32\u0E15\u0E23\u0E10\u0E32\u0E19\u0E17\u0E35\u0E48\u0E2A\u0E2D\u0E14\u0E04\u0E25\u0E49\u0E2D\u0E07\u0E01\u0E31\u0E19\u0E17\u0E31\u0E49\u0E07 TrueMoney & PayPal \u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08",
        promotionConfig: reset,
        effectiveTrueMoneyTiers,
        effectivePayPalPackages
      });
    } catch (err) {
      next(err);
    }
  });
  app.use("/api", (_req, res) => {
    res.status(404).json({ ok: false, message: "API route not found." });
  });
  app.use(
    (err, _req, res, _next) => {
      if (err instanceof TransactionDomainError) {
        res.status(err.httpStatus).json({
          ok: false,
          code: err.code,
          message: err.message
        });
        return;
      }
      console.error(
        "[Internal Error Handler]",
        err instanceof Error ? err.stack || err.message : err
      );
      res.status(500).json({
        ok: false,
        code: "INTERNAL_ERROR",
        message: "\u0E40\u0E01\u0E34\u0E14\u0E02\u0E49\u0E2D\u0E1C\u0E34\u0E14\u0E1E\u0E25\u0E32\u0E14\u0E20\u0E32\u0E22\u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A \u0E18\u0E38\u0E23\u0E01\u0E23\u0E23\u0E21\u0E16\u0E39\u0E01\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34 (Transaction Rolled Back)"
      });
    }
  );
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path2.resolve(process.cwd(), "dist");
    app.use(
      express.static(distPath, {
        maxAge: "7d",
        immutable: true,
        index: false
      })
    );
    app.get("*", (_req, res) => {
      res.sendFile(path2.join(distPath, "index.html"));
    });
  }
  const httpServer = app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `OpenMU-WebShop Server [${process.arch}] listening on http://0.0.0.0:${PORT}`
    );
  });
  const gracefulShutdown = async (signal) => {
    console.info(`[Shutdown] Received ${signal}. Draining connections...`);
    httpServer.close(async () => {
      await closeRedisConnection().catch(() => {
      });
      const pool = getPgPool();
      if (pool) {
        await pool.end().catch(() => {
        });
      }
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 1e4).unref();
  };
  process.on("SIGTERM", () => void gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => void gracefulShutdown("SIGINT"));
}
startServer().catch((fatalErr) => {
  console.error("[Fatal Startup Error]", fatalErr);
  process.exit(1);
});
export {
  PAYPAL_PACKAGES,
  TRUEMONEY_TIERS
};
