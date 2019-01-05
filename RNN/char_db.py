import json

from gensim.models import Word2Vec
import numpy as np

class CharDB:
    def __init__(self, char_file_name):
        self.char_file_name = char_file_name
        self.article = ""
        self.genBopomofoDict()
    def readArticle(self, filename):
        with open(filename) as f:
            self.article += f.read() + "\n"

    def genBopomofoDict(self):
        json_data = None
        with open(self.char_file_name) as f:
            json_data = json.load(f)

        self.bopomofo_dict = {}
        for char_info in json_data:
            if(len(char_info["title"]) != 1):
                continue
            has_bopomofo = False
            bopomofo_list = []
            for heteronym in char_info["heteronyms"]:
                if("bopomofo" in heteronym):
                    bopomofo_list.append(heteronym["bopomofo"])
                    has_bopomofo = True
            if has_bopomofo:  # only those with bopomofo need to be in the list
                self.bopomofo_dict[char_info["title"]] = bopomofo_list

    def genWordEmbedding(self):
        array_ch = []
        for ch in self.article:
            if(ch in self.bopomofo_dict):
                array_ch.append(ch)

        print("Word Embedding START")
        we_model = Word2Vec(array_ch, min_count=10, size=30, workers=4)
        print("Word Embedding DONE")

        ch_items = we_model.wv.vocab.items()
        self.ch_id_dict = { "__unknown__": 0, "__pad__": 1 }
        self.we_mat = np.zeros((len(ch_items) + 2, we_model.vector_size))
        for i, ch_item in enumerate(ch_items):
            ch = ch_item[0]
            self.ch_id_dict[ch] = i + 2
            self.we_mat[i + 2, :] = we_model.wv[ch]
    
    def saveWE(self, dict_name="ch_id_dict.npy", mat_name="we_mat.npy"):
        np.save(dict_name, self.ch_id_dict)
        np.save(mat_name, self.we_mat)

    def loadWE(self, dict_name="ch_id_dict.npy", mat_name="we_mat.npy"):
        self.ch_id_dict = np.load(dict_name).item()
        self.we_mat = np.load(mat_name)

    def chars2XandY(self, s, arr_len=5):
        mat_X = []
        mat_Y = []
        for line in str.split(s, "\n"):
            #print(line)
            front = -arr_len
            while(front + arr_len < len(line)):
                if(not line[front + arr_len] in self.ch_id_dict):
                    line = line[front + arr_len + 1:]
                    front = -arr_len
                    continue
                arr_idx = []
                mat_Y.append(self.ch_id_dict[line[front + arr_len]])
                for i in range(front, front + arr_len):
                    idx, ch = self.ch_id_dict["__unknown__"], None
                    if(i < 0):
                        idx = self.ch_id_dict["__pad__"]
                    elif(line[i] in self.ch_id_dict):
                        idx = self.ch_id_dict[line[i]]
                        #print(line[i])
                    arr_idx.append(idx)
                #print("Ans: " + line[front + arr_len])
                #print("====")
                mat_X.append(arr_idx)
                front += 1
        return np.matrix(mat_X), self.idx2OneHot(mat_Y)
    
    def idx2OneHot(self, mat_idx):
        ch_count = self.getCharCount()
        one_hot = np.zeros((len(mat_idx), ch_count))
        for i, idx in enumerate(mat_idx):
            one_hot[i, idx] = 1
        return one_hot
        
    def getCharCount(self):
        return len(self.we_mat)

if __name__ == "__main__":
    db = CharDB("../data/dict-revised.unicode.json")
    db.readArticle("../data/train_x.csv")
    db.readArticle("../data/test_x.csv")
    db.genWordEmbedding()
    db.saveWE()
