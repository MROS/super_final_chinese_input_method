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

s = "init"
print("go")
sys.stdout.flush()
while(True):
    s = sys.stdin.readline()
    [prefix, bopomofo] = str.split(s[:-1], ",")
    ch = predict(prefix, bopomofo)
    print(ch)
    sys.stdout.flush()
    
