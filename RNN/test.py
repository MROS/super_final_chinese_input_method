import re

from predict import predictSeq

BOPOMOFO_SET = "ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄧㄨㄩㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ"
TONE_SET = "ˇˋˊ˙ "

class BopomofoList:
    def __init__(self):
        self.a = []
        self.cur_bopomofo= []
    def push(self, bopomofo):
        if(bopomofo in BOPOMOFO_SET):
            self.cur_bopomofo.append(bopomofo)
        elif(bopomofo in TONE_SET):
            if(len(self.cur_bopomofo) > 0):
                if(bopomofo == "˙"):
                    s = bopomofo + str.join("", self.cur_bopomofo)
                elif(bopomofo == " "):
                    s = str.join("", self.cur_bopomofo)
                else:
                    s = str.join("", self.cur_bopomofo) + bopomofo
                self.cur_bopomofo = []
                self.a.append(s)
                
DATA_OFFSET = 0
DATA_N = 100

array_truth = []
array_bopomofo = []
with open("../testing/bench.txt") as f:
    array_truth = re.split(r", *", f.read())[DATA_OFFSET:DATA_OFFSET+DATA_N]

with open("../testing/bench_bopomofo.txt") as f:
    array_bopomofo = re.split(r", *", f.read())[DATA_OFFSET:DATA_OFFSET+DATA_N]

array_predict = []

a_length = []
a_miss = []
a_miss_rate = []

with open("../testing/rnn_out.txt", "w") as f:
    for i in range(len(array_truth)):
        bopomofo_list = BopomofoList()
        for bopomofo in array_bopomofo[i]:
            bopomofo_list.push(bopomofo)
        array_predict.append(predictSeq(bopomofo_list.a, {}))

        a_length.append(len(array_truth[i]))
        a_miss.append(0)
        a_miss_rate.append(0)

        if(len(array_truth[i]) != len(array_predict[i])):
            continue
        for j in range(a_length[i]):
            if(array_predict[i][j] != array_truth[i][j]):
                a_miss[i] += 1
        a_miss_rate[i] = a_miss[i] / a_length[i]

        f.write(array_predict[i])
        f.write(array_truth[i])
        print(array_predict[i])
        print(array_truth[i])

    print("共有%d句，平均長度為%.2f" % (DATA_N, sum(a_length) / DATA_N))
    print("每句的平均錯誤率為%.4f" % (sum(a_miss_rate) / DATA_N))
    print("總錯誤率為%.4f" % (sum(a_miss) / sum(a_length)))
