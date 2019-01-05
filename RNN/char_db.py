import json

from gensim.models import Word2Vec
import numpy as np

class CharDB:
    def __init__(self, char_file_name):
        self.char_file_name = char_file_name
        self.article_file_names = []
        self.genBopomofoDict()
    def setArticleName(self, filename):
        self.article_file_names.append(filename)
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
        for article_file_name in self.article_file_names:
            with open(article_file_name) as f:
                s = f.read()
                for ch in s:
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
            self.we_mat[i + 1, :] = we_model.wv[ch]
    
    def saveWE(self, dict_name="ch_id_dict.npy", mat_name="we_mat.npy"):
        np.save(dict_name, self.ch_id_dict)
        np.save(mat_name, self.we_mat)

    def loadWE(self, dict_name="ch_id_dict.npy", mat_name="we_mat.npy"):
        self.ch_id_dict = np.load(dict_name).item()
        self.we_mat = np.load(mat_name)


if __name__ == "__main__":
    db = CharDB("../data/dict-revised.unicode.json")
    db.setArticleName("../data/train_x.csv")
    db.setArticleName("../data/test_x.csv")
    db.genWordEmbedding()
    db.saveWE()
