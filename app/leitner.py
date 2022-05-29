#!/usr/bin/python3

import numpy as np

# Indexes for numpy arrays:
#   - Word handling:
word_index = 1
module_index = 0
memoryscore_index = 2
repeatscore_index = 3
par_index = 4
refresher_index = 5
maxstars_index = 6
number_of_repeats_index = 7
compound_weight_index = 8

#  - Module handling
module_index = 0
module_box_index = 1
module_weight_index = 2
module_meanmaxstars_index=3

card_type_code = { 'mem': 1, # memory
                   'rep': 0, # repetition
                   'ref': 0  } # refresher
                               

back_to_zero_mode = False

class Leitner:
    """Implements a variation of Leitner flashcard selection system
    Word flashcards are divided into theme modules, and within theme modules
    the flashcards are put into Leitner boxes. Random sampling is used to select
    a theme module, and flashcards are selected from that theme again by random
    sampling.
    Usage: 
    1. Initialise a Leitner object with dictionaries of known words and modules and their indices
    2. Initialise player's word and module dictionaries from your default template
    3. Call update_modules with the player's data
    4. call get_words with the player's data to get a selection of words that will be tried by the player
    5. call the update_remembered_word or update_repeated word for each challenge 
       done by the player and save the player data. 
    6. Go to 3. Remember to save the player data structures!
    Attrributes
    ----------
    word_dict : dictionary
       The mapping from word string representations to indexes
    module_dict : dictionary
       The mapping from flashcard module collection names to indexes
    chance_for_all_memory : Float (optional, default=0.4)
       The probability of giving an "all-memory" flashcard selection
    word_pars : integer or dictionary
       The par values for all words
    default_box_probability_param : Float (optiona, default 2.5)
       Parameter for weighting least repeated boxes when sampling words to practise
    Methods
    -------
    score_to_weight(val):
       Compute probability score from Leitner box value
    get_module(module_data, box_probability_param=-1, verbose=False):
       Select a flashcard collection module from which to draw words, based on Leitner probabilities
    get_words( word_data=None, module_data=None, module=None, count=5, box_probability_param=-1, style='arr', verbose=False):
       Select flashcards collection module from a module based on Leitner probabilities
    leitner_format(data, style='arr', module=-1):
       Format the object containing the selected flashcards
    update_word( w, word_data, score, challenge_type):
       Update Leitner values of a word based on challenge type
    update_repeated_word( w, word_data,score):
       Update Leitner values of a word when challenge was of type "repetition"
    update_remembered_word( w, word_data,score):
       Update Leitner values of a word when challenge was of type "memory"
    update_modules( word_data, module_data, verbose=False):
       Update Leitner values of flashcard collection modules
    numpy_word_to_json( word_data) :
       Return a dictionary representation of word data numpy array
    numpy_module_to_json( module_data) : 
       Return a dictionary representation of module data numpy array
    numpy_to_json( word_data, module_data ):
       Return dictionary representations of word and module data numpy arrays
    json_module_to_numpy( module_json):
       Return a numpy array representation of module data dictionary
    json_word_to_numpy( word_json):
       Return a numpy array representation of word data dictionary
    json_to_numpy( word_json, module_json):
       Return numpy array representations of word and module data dictionaries
    """

    word_dict = {}
    module_dict = {}
    chance_for_all_memory = 0.4
    word_pars = 2
    default_par = 2
    default_box_probability_param = 2.5
    
    def __init__(self, word_dict=None, module_dict=None, word_pars=None,chance_for_all_memory=0.4):
        """Initialise the Leitner system module
        Parameters
        ----------
        word_dict : dictionary
          The mapping from word string representations to indexes
        module_dict : dictionary
          The mapping from flashcard module collection names to indexes
        chance_for_all_memory : Float (optional, default=0.4)
          The probability of giving an "all-memory" flashcard selection
        word_pars : integer or dictionary
          The par values for all words
        
        """


        if word_dict is not None:
            self.word_dict = word_dict
        if module_dict is not None:
            self.module_dict=module_dict
        if word_pars is not None:
            self.word_pars=word_pars
        self.chance_for_all_memory = chance_for_all_memory

    # Score to weight:
    # A higher score means a higher skill level (or luck?) and thus  means less frequent repetitions.
    # A geometrical dampening is used: 1, 0.5, 0.25, 0.125, ...
    def score_to_weight(self,val, box_probability_param=-1):
        if val < 0:
            return 0
        else:
            if box_probability_param > 0:
                return 1 / np.power(box_probability_param, val)
            else:
                return 1 / np.power(self.default_box_probability_param, val)


    def get_par(self, word):
        if type(self.word_pars) == dict:
            if word in self.word_pars.keys():
                return self.word_pars[word]
        if type(self.word_pars) == int:
            return self.word_pars
        return self.default_par
                
    # Select a random word module from active modules,
    # with probabilities weighted as described above:

    def get_module(self, module_data, box_probability_param=-1, verbose=False):
        """Select a flashcard theme module from which to sample flashcards
        Parameters
        ----------
        module data : dictionary or numpy array
          The speaker's module data object 
        box_probability_param : float (optional)
          Parameter for weighting least repeated boxes when sampling words to practise
        
        Returns
        -------
        numpy.float32
           The index of the selected module
        """
        
        if not isinstance(module_data, np.ndarray):
            module_data, module_list = self.json_module_to_numpy(module_data)

        for m in range(module_data.shape[0]):
            if module_data[m, module_box_index] >= 0:
                module_data[m, module_weight_index] = self.score_to_weight(module_data[m,module_box_index], box_probability_param=box_probability_param)
                if verbose:
                    print("Box %i: prob %0.2f" % (module_data[m,0], self.score_to_weight( module_data[m,module_box_index], box_probability_param=box_probability_param )))
            else:
                module_data[m, module_weight_index] = 0
                if verbose:
                    print("Box %i: prob %0.2f" % (module_data[m,0], 0))
        module_data[:, module_weight_index] /= module_data[:, module_weight_index].sum()
        if verbose:
            print("totalWeight:", totalWeight)
        return  np.random.choice(module_data[:,0], 1, p=module_data[:,module_weight_index])[0]


    def get_words(self, word_data=None, module_data=None, module=None, count=5, box_probability_param=-1, chance_for_all_memory=-1,style='arr', verbose=False):
        """Select word flashcards
        Parameters
        ----------
        word_data : dictionary or numpy array
          The speaker's word data object 
        module data : dictionary or numpy array
          The speaker's module data object 
        count : int (optional, default=7)
          Number of word flashcards to select
        box_probability_param : float (optional)
          Parameter for weighting least repeated boxes when sampling words to practise
        chance_for_all_memory : Float (optional, default=0.4)
          The probability of giving an "all-memory" flashcard selection
        style: string (optional, default='arr')
          Output style, either 'arr' or 'vertti'
        
        Returns
        -------
        list or dictionary
           collection of word challenges formatted according to user's wishes
        """

        if not isinstance(word_data, np.ndarray):
            word_data, word_list = self.json_word_to_numpy(word_data)

            
        if module == None:
            module = self.get_module(module_data)

        totalWeight =0
        memoryWeight = 0
        memorycount = 0

        memcards = np.where( (word_data[:,module_index]==module) & (word_data[:, memoryscore_index] > -1) & (word_data[:, refresher_index]  < 1) )[0]

        if chance_for_all_memory < 0:
            chance_for_all_memory = self.chance_for_all_memory
        if len(memcards) >= count and np.random.rand() < chance_for_all_memory:
            # Select from memory cards only!
            for i in memcards:
                word_data[i, compound_weight_index] =  self.score_to_weight( word_data[i, memoryscore_index], box_probability_param=box_probability_param)
            word_data[memcards, compound_weight_index] /= word_data[memcards, compound_weight_index].sum()
            selected = np.random.choice(memcards, count, replace=False, p=word_data[memcards, compound_weight_index])
            return self.leitner_format([ {'type' : 'mem',
                                          'word' : word_list[i], #self.word_dict[i],
                                          'index':int(i),
                                          'repbox': int(word_data[i,repeatscore_index]),
                                          'membox': int(word_data[i, memoryscore_index]),
                                          'par' : int(word_data[i, par_index])} for i in selected ], style=style, module=module) 


        cards = np.where(word_data[:,module_index]==module)[0]
        for i in cards:
            if word_data[i, memoryscore_index] > -1:
                word_data[i, compound_weight_index] =  self.score_to_weight( word_data[i, memoryscore_index], box_probability_param=box_probability_param) + self.score_to_weight( word_data[i, repeatscore_index], box_probability_param=box_probability_param)
            else:
                word_data[i, compound_weight_index] =  self.score_to_weight( word_data[i, repeatscore_index], box_probability_param=box_probability_param)
        word_data[cards, compound_weight_index] /= word_data[cards, compound_weight_index].sum()     
        selected = np.random.choice(  cards, count, replace=False, p=word_data[cards, compound_weight_index] )
        r = []
        num_refreshers = 0
        for i in selected:
            if word_data[i, memoryscore_index] > -1 and np.random.rand() < self.score_to_weight( word_data[i, memoryscore_index], box_probability_param=box_probability_param) / ( self.score_to_weight( word_data[i, memoryscore_index], box_probability_param=box_probability_param) + self.score_to_weight( word_data[i, repeatscore_index], box_probability_param=box_probability_param)):
                    r.append(  {'type' : 'mem',
                                'word' : word_list[i], #self.word_dict[i],
                                'index': int(i),
                                'repbox': int(word_data[i,repeatscore_index]),
                                'membox': int(word_data[i, memoryscore_index]),
                                'par' : int(word_data[i, par_index]) }  )
                    if word_data[i, refresher_index] > 0:
                        r.insert(num_refreshers,  {'type' : 'ref',
                                                   'word' : word_list[i], #self.word_dict[i],
                                                   'index': int(i),
                                                   'repbox': int(word_data[i,repeatscore_index]),
                                                   'membox': int(word_data[i, memoryscore_index]),
                                                   'par' : int(word_data[i, par_index]) } )
                        num_refreshers += 1
            else:
                r.insert(num_refreshers,  {'type' : 'rep',
                                           'word' : word_list[i], #self.word_dict[i],
                                           'index': int(i),
                                           'repbox': int(word_data[i,repeatscore_index]),
                                           'membox': int(word_data[i, memoryscore_index]),
                                           'par' : int(word_data[i, par_index]) }  )
        return self.leitner_format(r, style=style, module=module)


    def leitner_format(self,data, style='arr', module=-1):
        if style == 'vertti':
            return { 'module': int(module),
                     'chosenWords' : [ d['word'] for d in data ],
                     'cardType' : [ card_type_code[d['type']] for d in data ],
                     'pars' : [ int(d['par']) for d in data ] }
        else:
            return data
            
    
    def update_word(self, w, word_data, score, challenge_type):
        score=int(score)
        return_json=False
        if not isinstance(word_data, np.ndarray):
            word_data, word_list = self.json_word_to_numpy(word_data)
            return_json = True

        if isinstance(w, str):
            w = word_list[w] #self.word_dict[w]

            
        if challenge_type == 'mem':
            if score > word_data[w,par_index]:
                word_data[w,memoryscore_index] += 1
                word_data[w,refresher_index] = 0
            elif score == word_data[w,par_index]:
                word_data[w,refresher_index] = 1
            elif score < word_data[w,par_index]:
                if back_to_zero_mode is True:
                    word_data[w,memoryscore_index] = 0
                word_data[w,refresher_index] = 1
        elif challenge_type == 'rep':
            if score > word_data[w,par_index]:
                word_data[w,repeatscore_index] += 1
                if word_data[w,repeatscore_index] >= 2 and  word_data[w,memoryscore_index] < 0:
                    word_data[w,memoryscore_index] = 0
                word_data[w,refresher_index] = 0
            elif back_to_zero_mode is True and score < word_data[w,par_index]:
                word_data[w,repeatscore_index] = 0

        word_data[w, number_of_repeats_index] += 1

        if word_data[w,maxstars_index] < score:
            word_data[w,maxstars_index] = score
            
        if return_json:
            word_data = self.numpy_word_to_json(word_data, word_list)
            
        return word_data


            
    def update_repeated_word(self, w, word_data,score):
        """Update Leitner values for a word in a repetition challenge
        Parameters
        ----------
        w : 
          The word for which parameters are to be updated
        word_data : dictionary or numpy array
          The speaker's word data object 
        score : int
          The score the player received in the challenge
        
        Returns
        -------
        numpy array or dictionary
           user word data in the same format as where it was given
        """        
        return self.update_word(w, word_data,score, 'rep')
 
    def update_remembered_word(self, w, word_data,score):
        """Update Leitner values for a word in a memory challenge
        Parameters
        ----------
        w : 
          The word for which parameters are to be updated
        word_data : dictionary or numpy array
          The speaker's word data object 
        score : int
          The score the player received in the challenge  
      
        Returns
        -------
        numpy array or dictionary
           user word data in the same format as where it was given
        """        
        return self.update_word(w, word_data,score, 'mem')


    def update_modules(self, word_data, module_data, verbose=False):
        """Update Leitner values for theme modules in a repetition challenge
        Parameters
        ----------
        word_data : dictionary or numpy array
          The speaker's word data object 
        module_data : dictionary or numpy array
          The speaker's module data object 
        
        Returns
        -------
        numpy array or dictionary
           user module data in the same format as where it was given
        """        

        if not isinstance(word_data, np.ndarray):
            word_data, word_list = self.json_word_to_numpy(word_data)

        return_module_json = False
        if not isinstance(module_data, np.ndarray):
            module_data, module_list = self.json_module_to_numpy(module_data)
            return_module_json = True

            
        if verbose:
            print("Update module boxes")
        score_0_modules = 0
        for module in module_data[module_data[:,module_box_index] > -1 ,0]:
            #module_data[int(module), module_box_index] = max(0, np.median( word_data[ word_data[:,module_index]==module, memoryscore_index ]) )
            module_data[int(module), module_box_index] = max(0, np.percentile( word_data[ word_data[:,module_index]==module, memoryscore_index ], 33) )
            module_data[int(module), module_meanmaxstars_index] = np.mean( word_data[ word_data[:,module_index]==module, maxstars_index ] )
            
            if  module_data[int(module), module_box_index] == 0:
                score_0_modules += 1
            if verbose:
                print(" Module %i box %.1f avg.stars %.1f" % (module, module_data[int(module), module_box_index],module_data[int(module), module_meanmaxstars_index] ))
            
        if score_0_modules < 2 and module_data[:,module_box_index].min() < 0:
            new_module = np.random.choice(np.where(module_data[:,module_box_index] < 0)[0][:3])
            module_data[new_module, module_box_index] = 0
            if verbose:
                print("==============================")
                print("New module(%i) available!" % int(new_module))  

        if return_module_json:
            module_data = self.numpy_module_to_json(module_data, module_list)
        if verbose:
            print("Returning", module_data)
        return module_data


    def short_progress_report(self, word_data, module_data):
        np_words, word_list = self.json_word_to_numpy(word_data)
        return { 'words' : { 'seen' :  (np_words[:,maxstars_index]>-1).sum() ,
                             'repeated' : (np_words[:,maxstars_index]>2).sum(),
                             'memorized' : (np_words[:,memoryscore_index]>0).sum() } }
                             

    """ 
    Long progress report lists all modules with their statistics,
    and all the words in the module with some statistics.

    {'modules': [{'memorized': 0.875,
              'score': 4.0,
              'stars': '★★★★☆',
              'theme': 'animals',
              'words': [{'best_score': 4.0,
                         'memorized': False,
                         'repeats': 3.0,
                         'word': 'en_gb_animal'},
                        {'best_score': 4.0,
                         'memorized': True,
                         'repeats': 7.0,
                         'word': 'en_gb_kitten'},
                        {'best_score': 4.0,
                         'memorized': True,
                         'repeats': 6.0,
                         'word': 'en_gb_fish'},
                        {'best_score': 4.0,
                         'memorized': True,
                         'repeats': 5.0,
                         'word': 'en_gb_lizard'},
                        {'best_score': 4.0,
                         'memorized': True,
                         'repeats': 6.0,
                         'word': 'en_gb_bunny'},
                        {'best_score': 4.0,
                         'memorized': True,
                         'repeats': 4.0,
                         'word': 'en_gb_bee'},
                        {'best_score': 4.0,
                         'memorized': True,
                         'repeats': 6.0,
                         'word': 'en_gb_monkey'},
                        {'best_score': 4.0,
                         'memorized': True,
                         'repeats': 8.0,
                         'word': 'en_gb_eagle'}]},
             {'memorized': 1.0,
              'score': 4.0,
              'stars': '★★★★☆',
              'theme': 'food',
              'words': [{'best_score': 4.0,
                         'memorized': True,
                         'repeats': 5.0,
                         'word': 'en_gb_food'},
                        {'best_score': 4.0,
                         'memorized': True,
                         'repeats': 6.0,
                         'word': 'en_gb_fruit'},
                        {'best_score': 4.0,
                         'memorized': True,
                         'repeats': 5.0,
                         'word': 'en_gb_juice'},
                        {'best_score': 4.0,
                         'memorized': True,
                         'repeats': 4.0,
                         'word': 'en_gb_tomato'},
                        {'best_score': 4.0,
                         'memorized': True,
                         'repeats': 6.0,
                         'word': 'en_gb_sugar'},
                        {'best_score': 4.0,
                         'memorized': True,
                         'repeats': 5.0,
                         'word': 'en_gb_cookie'},
                        {'best_score': 4.0,
                         'memorized': True,
                         'repeats': 5.0,
                         'word': 'en_gb_sauce'},
                        {'best_score': 4.0,
                         'memorized': True,
                         'repeats': 4.0,
                         'word': 'en_gb_corn'}]},
    ...

    """
    
    def long_progress_report(self, word_data, module_data):
        module_progress = []
        np_words, word_list = self.json_word_to_numpy(word_data)

        for m in module_data:
            theme = m['theme']
            modulewords = np.where(np_words[:,module_index]== m['module'])[0]
            if m['box'] > -1:
                mean = np.mean(np.clip(np_words[modulewords, maxstars_index], 0,5))
                #score = "%0.1f" % mean
                score = float(np.around(mean,1))
                stars = ''.join(['\u2605' for i in range(int(mean))]) + ''.join([ '\u2606' for i in range(5-int(mean)) ])
                #memorized = "%i %s" % (100*np.sum(np.clip(np_words[modulewords, memoryscore_index], 0,1))/len(modulewords), "%")
                memorized = float(np.around(np.sum(np.clip(np_words[modulewords, memoryscore_index], 0,1))/len(modulewords),2))
            else:
                score = float(0.0)
                stars = ''
                memorized = float(0.0)
            words_arr = [ { 'word' : word_list[i],
                            'best_score' : int(np_words[i, maxstars_index]),
                            'memorized' : [False, True][np_words[i, memoryscore_index]>0],
                            'repeats' : int(np_words[i, number_of_repeats_index]) } for i in modulewords ] 
            module_progress.append({'theme' : theme,
                                    'score' : score,
                                    'stars' : stars,
                                    'memorized' : memorized,
                                    'words' : words_arr } ) 
        return { 'words' : { 'seen' :  int((np_words[:,maxstars_index]>-1).sum()) ,
                             'repeated' : int((np_words[:,maxstars_index]>2).sum()),
                             'memorized' : int((np_words[:,memoryscore_index]>0).sum()) },
                 'modules' : module_progress }

                 
    def numpy_word_to_json(self, word_data, word_list) : 
        word_json = []
        for i in range(word_data.shape[0]):
            word_json.append( { 'word': word_list[i], #self.word_dict[word_data[i,word_index]],
                                'module' : int(word_data[i,module_index]),
                                'membox' : int(word_data[i, memoryscore_index]),
                                'repbox' : int(word_data[i, repeatscore_index]),
                                'refresh' : int(word_data[i,refresher_index]),
                                'maxstars' : int(word_data[i,maxstars_index]),
                                'numrepeats' : int(word_data[i,number_of_repeats_index]) })
        return word_json

    def numpy_module_to_json(self, module_data, module_list) : 
        module_json = []
        for i in range(module_data.shape[0]):
            module_json.append({'module' : int(module_data[i,0]),
                                'box' : int(module_data[i,1]),
                                'theme' : module_list[i], #self.module_dict[i],
                                'meanmaxstars' : int(module_data[i,2]) })

        return module_json
    
    def numpy_to_json(self, word_data, word_list,  module_data, module_list ):
        word_json = self.numpy_word_to_json(word_data, word_list)
        module_json = self.numpy_module_to_json(module_data, module_list)
        return word_json, module_json

    def json_module_to_numpy(self, module_json):
        module_data = []
        module_list = {}
        for i,m in enumerate(module_json):
            module_list[i] = m['theme']
            module_list[ m['theme']] = i
            module_data.append([m['module'], m['box'], m['meanmaxstars'],0])
        return np.array(module_data, dtype=np.float32), module_list

    def json_word_to_numpy(self, word_json):
        word_data = []
        word_list = {}
        for i,wj in enumerate(word_json):
            word_list[wj['word']] = i
            word_list[i] = wj['word']
            w = [0]*9
            w[word_index] = i #self.word_dict[wj['word']]
            w[module_index] = wj['module']
            w[memoryscore_index] = wj['membox']
            w[repeatscore_index] = wj['repbox']
            w[par_index] = self.get_par(wj['word'])
            #if isinstance(self.word_pars, int):
            #    w[par_index] = self.word_pars
            #else:
            #    w[par_index] = self.word_pars[wj['word']]
            w[refresher_index] = wj['refresh']
            w[maxstars_index] = wj['maxstars']
            if 'numrepeats' in wj.keys():
                w[number_of_repeats_index] = wj['numrepeats']
            else:
                w[number_of_repeats_index] = 0
            w[compound_weight_index] = 0
            
            word_data.append(w)

        
        return np.array(word_data, dtype=np.float32), word_list

    def json_to_numpy(self, word_json, module_json):
        module_data, module_list = self.json_module_to_numpy( module_json)
        word_data, word_list = self.json_word_to_numpy( word_json)
        return word_data, word_list, module_data, module_list
