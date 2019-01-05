import tensorflow as tf
import numpy as np

from keras.layers import Dense, Dropout, Activation , Flatten, TimeDistributed, AveragePooling1D
from keras.layers import Bidirectional
from keras.models import Sequential
from keras.preprocessing import sequence
from keras.layers import Embedding, LSTM, GRU, SimpleRNN
from keras.preprocessing.image import ImageDataGenerator
from keras.callbacks import EarlyStopping,ModelCheckpoint
from keras import optimizers
from keras import regularizers
from keras.utils import np_utils
import keras.callbacks

from char_db import CharDB

char_db = CharDB("../data/dict-revised.unicode.json")
char_db.loadWE()
char_db.readArticle("../data/train_x.csv")
char_db.readArticle("../data/test_x.csv")
article = char_db.article
train_X, train_Y = char_db.chars2XandY(article[:len(article)//3])
val_X, val_Y = char_db.chars2XandY(article[len(article)//3+1:len(article)//3+1000])

with tf.device("/gpu:0"):
    model = Sequential()
    model.add(Embedding(len(char_db.we_mat),
                        30,
                        weights=[char_db.we_mat],
                        trainable=True,
                        input_length=5))
    model.add(GRU(60, return_sequences=False, dropout=0.3, recurrent_dropout=0.3))
    model.add(Dense(units=char_db.getCharCount(), activation='relu'))
    model.add(Dense(char_db.getCharCount(), activation='softmax'))
    model.summary()

    model.compile(loss="categorical_crossentropy",
                       optimizer= 'adam',
                       metrics=(['accuracy']))
    
    early_stopping = EarlyStopping(monitor='val_loss', min_delta=0, patience=10, verbose=0, mode="auto")
    checkpt = ModelCheckpoint('ckpt/model-{epoch:05d}-{val_acc:.5f}.h5', monitor='val_acc', save_best_only=True, period=1)
    history = model.fit(train_X, train_Y,
              batch_size=1024, epochs=50, validation_data=(val_X, val_Y), callbacks=[checkpt, early_stopping])
