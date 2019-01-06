import sys

import numpy as np
import tensorflow as tf
from keras.models import load_model
from keras.preprocessing import sequence

from char_db import CharDB

model = load_model("./model.h5")
char_db = CharDB("../data/dict-revised.unicode.json")
char_db.loadWE()

def predict(prefix, bopomofo):
    max_ch = ""
    max_prob = -1
    test_X = np.array([char_db.chars2Idxs(prefix)])
    predict_Y = model.predict(test_X)
    for idx, prob in enumerate(predict_Y[0, :]):
        ch = char_db.id_ch_dict[idx]
        if(len(ch) > 1):
            continue
        if(bopomofo in char_db.bopomofo_dict[ch]):
            if(prob > max_prob):
                max_prob = prob
                max_ch = ch
    return max_ch

def predictProb(prefix, bopomofo):
    prob_list = []
    test_X = np.array([char_db.chars2Idxs(prefix)])
    predict_Y = model.predict(test_X)
    for idx, prob in enumerate(predict_Y[0, :]):
        ch = char_db.id_ch_dict[idx]
        if(len(ch) > 1):
            continue
        if(bopomofo in char_db.bopomofo_dict[ch]):
            prob_list.append((prob, ch))
    return prob_list

def predictShortSeq(bopomofo_seq, offset=0, selected_dict={}):
    (prob, postfix) = predictSeqAt(0, bopomofo_seq, "", offset, selected_dict)
    return postfix

def predictSeqAt(target, bopomofo_seq, prefix_seq, offset, selected_dict):
    if(len(bopomofo_seq) == len(prefix_seq)):
        return (1, "")
    else:
        if((target + offset) in selected_dict):
            ch = selected_dict[target]
            (new_prob, postfix_seq) = predictSeqAt(target+1, bopomofo_seq,
                prefix_seq+ch, offset, selected_dict)
            return (new_prob, ch + postfix_seq)
        prob_list = predictProb(prefix_seq, bopomofo_seq[target])
        max_postfix = ""
        max_prob = - 1
        
        if(target != 0 and max(prob_list)[0] > 0.05): # fast cut ?
            prob_list = [max(prob_list)]

        for (prob, ch) in prob_list:
            (new_prob, postfix_seq) = predictSeqAt(target+1, bopomofo_seq,
                prefix_seq+ch, offset, selected_dict)
            new_prob *= prob
            if(new_prob > max_prob):
                max_postfix = ch + postfix_seq
                max_prob = new_prob
        return (max_prob, max_postfix)

N = 3
def predictSeq(bopomofo_seq, selected_dict={}):
    prefix = ""
    offset = 0
    while(len(bopomofo_seq) > N):
        new_prefix = predictShortSeq(bopomofo_seq[:N], offset, selected_dict)
        prefix += new_prefix[:N-1]
        selected_dict[len(prefix)-1] = prefix[-1]
        bopomofo_seq = bopomofo_seq[N-1:]
        offset += N-1
    prefix += predictShortSeq(bopomofo_seq, offset, selected_dict)
    return prefix

        
s = "init"
print("go")
sys.stdout.flush()

print(predictSeq(["ㄐㄧ", "ㄧㄣ", "ㄉㄜˊ"]))
print(predictSeq(["ㄐㄧ", "ㄧㄣ"]))
print(predictSeq(["ㄐㄧ", "ㄧㄣ"], selected_dict={ 0: "積" }))
print(predictSeq(["ㄏㄠˇ", "ㄌㄨㄥˊ", "ㄅㄧㄣ"]))
print(predictSeq(["ㄏㄠˇ", "ㄌㄨㄥˊ", "ㄅㄧㄥ"]))
print(predictSeq(["ㄏㄠˇ", "ㄋㄢˊ", "ㄖㄣˊ"]))

print(predictSeq(["ㄏㄠˇ", "ㄒㄧㄤˇ", "ㄈㄥ", "ㄎㄨㄤˊ", "ㄕㄨㄚˇ", "ㄈㄟˋ"], {}))
print(predictSeq(["ㄨㄛˇ", "ㄏㄨㄟˋ", "ㄘㄚ", "ㄑㄩˋ", "ㄨㄛˇ", "ㄅㄨˋ", "ㄒㄧㄠˇ", "ㄒㄧㄣ", "ㄉㄧ", "ㄒㄧㄚˋ", "˙ㄉㄜ", "ㄌㄟˋ", "ㄕㄨㄟˇ"], {}))

s = "ㄘㄚ,ㄑㄩˋ,ㄓㄨㄢˇ,ㄕㄣ,ㄌㄧˊ,ㄑㄩˋ,ㄓ,ㄏㄡˋ,ㄅㄨˋ,ㄓㄥ,ㄑㄧˋ,˙ㄉㄜ,ㄌㄟˋ"
print(predictSeq(str.split(s, ","), {}))

print(predictSeq(["ㄘㄤ", "ㄌㄨㄥˊ", "ㄋㄧˋ", "ㄊㄧㄢ", "ㄎㄨㄤˊ"], {}))

print(predictSeq(["ㄨˊ", "ㄒㄧㄢˋ", "ㄔㄥˊ"], {}))
print(predictSeq(["ㄒㄧㄝˇ", "ㄔㄥˊ", "ㄕˋ"], {}))

print(predictSeq(["ㄍㄠ", "ㄒㄩㄥˊ", "ㄕˋ"], {}))
print(predictSeq(["ㄐㄧㄝˇ", "ㄇㄚˇ", "ㄑㄧˋ"], {}))

print(predictSeq(["ㄕㄜˋ", "ㄐㄧㄥ"], {}))
print(predictSeq(["ㄕㄥˋ", "ㄐㄧㄝˊ", "ㄕˊ"], {}))
print(predictSeq(["ㄕㄣˋ", "ㄐㄧㄝˊ", "ㄕˊ"], {}))

print(predictSeq(["ㄨˊ", "ㄉㄧˋ", "ㄗˋ", "ㄖㄨㄥˊ"], {}))
print(predictSeq(["ㄨˊ", "ㄉㄧˋ", "ㄈㄤˋ", "ㄕˇ"], {}))

print(predictSeq(["ㄕㄨㄟˇ", "ㄆㄧㄥˊ", "ㄗㄨㄛˋ"], {}))

print(predictSeq(["ㄒㄧㄤˋ", "ㄇㄨˋ"], {}))
s = "ㄒㄧㄤˋ,˙ㄍㄜ,ㄍㄤ,ㄊㄧㄝˇ,ㄅㄢ"
print(predictSeq(str.split(s, ","), {}))
N = 5
print(predictSeq(str.split(s, ","), {}))


sys.exit(0)

while(True):
    s = sys.stdin.readline()
    [prefix, bopomofo] = str.split(s[:-1], ",")
    ch = predict(prefix, bopomofo)
    print(ch)
    sys.stdout.flush()
    
