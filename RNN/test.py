import re

#from predict import predictSeq

BOPOMOFO_SET = "ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄧㄨㄩㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ"
TONE_SET = "ˇˋˊ˙"

class BopomofoList:
    def __init__(self):
        self.a = []
        self.cur_bopomofo= []
    def push(self, bopomofo):
        if(bopomofo in BOPOMOFO_SET):
            self.cur_bopomofo.append(bopomofo)
        elif(bopomofo in TONE_SET):
            if(bopomofo == "˙"):
                s = bopomofo + str.join("", self.cur_bopomofo)
            else:
                s = str.join("", self.cur_bopomofo) + bopomofo
            self.cur_bopomofo = []
            self.a.append(s)
                
DATA_OFFSET = 0
DATA_N = 2

array_truth = []
array_bopomofo = []
with open("../testing/bench.txt") as f:
    array_truth = re.split(r", *", f.read())[DATA_OFFSET:DATA_OFFSET+DATA_N]

with open("../testing/bench_bopomofo.txt") as f:
    array_bopomofo = re.split(r", *", f.read())[DATA_OFFSET:DATA_OFFSET+DATA_N]

for i in range(len(array_truth)):
    bopomofo_list = BopomofoList()
    for bopomofo in array_bopomofo[i]:
        bopomofo_list.push(bopomofo)
    
