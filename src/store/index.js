import { createStore } from "vuex";
import axios from 'axios' 
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, getDoc, collection, db, doc, onAuthStateChanged, getDocs, setDoc, deleteDoc, updateDoc } from "../plug-in/firebase.js";

export default createStore({
  state: {
    error: '',
    valuesList: '',
    userData: {
      email: '',
      uid: '',
      depositSelect: 0,
      depositList: [],
      dataCrypto: [],
      listCryptoUser: [],
      walletList: [],
      walletSelected: '',
    },
    historyWalletDly: '',
    historyTimeDly: '',

    historyWalletWky: '',
    historyTimeWky: '',

    historyWalletMth: '',

    actualPrice: [ ],
    winLostValue: 0,
    ready: 0
  },
  mutations: {
    setError: function (state, error) {
      state.error = error;
    },
    setUserEmail: function (state, email) {
      state.userData.email = email;
    },
    setUserUid: function (state, uid) {
      state.userData.uid = uid;
    },
    setUserDataCrypto: function (state, snapshotResult) {
      for (const name in snapshotResult) {
        snapshotResult[name]['crypto'] = name
        state.userData.listCryptoUser.push(name)
        state.userData.dataCrypto.push(snapshotResult[name])
      }
    },
    setUserDepositList: function (state, snapshotResult) {
      for (const name in snapshotResult) {
        state.userData.depositList.push(snapshotResult[name])
      }
      /* console.log(state.userData.depositList) */
    },
    setUserDepositSelect: function (state, snapshotResult) {
      state.userData.depositSelect = snapshotResult.deposit
      /* console.log(state.userData.depositSelect) */
    },
    setActuelPrice: function (state, returnApi ) {
      for (const result in returnApi['resultRequest']) {
        for (const name in state.userData.dataCrypto) {
          if (result == state.userData.dataCrypto[name].crypto) {
            state.userData.dataCrypto[name].priceNow = (returnApi['resultRequest'][result].quote.USD.price).toFixed(3)
          }
        }
      }
    },
    setWinLostValue: function (state, resultSum) {
      state.winLostValue = 0
      state.winLostValue = resultSum;
    },
    setCryptoList: function (state, snapshotResult) {
      state.valuesList = snapshotResult
    },
    setWalletUser: function (state, snapshotResult) {
      for (const name in snapshotResult) {
        state.userData.walletList.push(name)
      }
      /* console.log(state.userData.walletList) */
    },
    setSelectedWallet: function (state, value) {
      state.userData.walletSelected = value
    },


    setHistoWalletDly: function (state, data) {
      state.historyWalletDly = data['tabCrypto']
      state.historyTimeDly =  data['tabTime']
      console.log(state.historyWalletDly)
    },
    setHistoWalletWky: function (state, data) {
      state.historyWalletWky = data['tabCrypto']
      state.historyTimeWky = data['tabTime']
      console.log(state.historyTimeWky)
    },
    setHistoWalletMth: function (state, data) {
      state.historyWalletMth = data
      console.log(state.historyWalletMth)
    },
    
  },
  getters: {
    getUserEmail: state => {
      return state.userData.email
    },
    getUserUid: state => {
      return state.userData.uid
    },
    getUserDataCrypto: state => {
      return state.userData.dataCrypto
    },
    getUserListCrypto: state =>{
      return state.userData.listCryptoUser
    },
    getUserWalletList: state =>{
      return state.userData.walletList
    },
    getUserDepositSelect: state =>{
      return state.userData.depositSelect
    },

    getHistoWalletDly: state =>{
      return state.historyWalletDly
    },
    getHistoTimeDly: state =>{
      return state.historyTimeDly
    },
    getHistoWalletWky: state =>{
      return state.historyWalletWky
    },
    getHistoTimeWky: state =>{
      return state.historyTimeWky
    },
  },
  actions: {
    signUp: ({commit}, userInfo) => {
      return new Promise(Validated => {
        var emailReg = new RegExp(/^(([^<>()[]\.,;:s@]+(.[^<>()[]\.,;:s@]+)*)|(.+))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/);
        var depositReg = new RegExp(/-+/);
        if (emailReg.test(userInfo["email"])) {
          if (userInfo["password"] == userInfo["confirm_pass"]) {
            if (!depositReg.test(userInfo["deposit"])) {
              createUserWithEmailAndPassword(auth, userInfo["email"], userInfo["password"]).then((userData) => {
                const userUid = userData.user.uid;
                setDoc(doc(db, `UserWallet/${userUid}/ListWallet/${userInfo["account"]}`), { 
                  deposit: userInfo["deposit"],
                }).then(() => {
                  Validated(true);
                })
              }).catch((error) => {
                commit('setError', error.code)
              })
            } else {
              commit('setError', 'err_depo');
            }
          } else {
            commit('setError', 'err_pass');
          }
        } else {
          commit('setError', 'err_mail');
        }
      })
    },
    signIn: ({commit}, userInfo) => {
      return new Promise(Validated => {
        var emailReg = new RegExp(/^(([^<>()[]\.,;:s@]+(.[^<>()[]\.,;:s@]+)*)|(.+))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/);
        if (emailReg.test(userInfo["email"])) {
          signInWithEmailAndPassword(auth, userInfo['email'], userInfo['password']).then(() => {
            Validated(true)
          }).catch(() => {
            commit('setError', 'err_mail')
          })
        } else {
          commit('setError', 'err_mail');
        }
      })
    },
    addOnWallet: ({commit, state}, cryptoInfo) => {
      return new Promise(Validated => {
        if (cryptoInfo['crypto']) {
          setDoc(doc(db, `UserCrypto/${cryptoInfo['uid']}/${state.userData.walletSelected}/${cryptoInfo['crypto']}`), {
            buyPrice: cryptoInfo['buyprice'], 
            quantity: cryptoInfo['quantity']
          }).catch(() => {
            commit('setError', 'err_addCrypto')
          })
          commit('setError', 'err_addCrypto')
          Validated(true)
        }      
      })
    },
    //requete donne user
    loadUserData: ({commit}) => {
      return new Promise(Validated => {
        onAuthStateChanged(auth, user => { 
          if (user) {
            commit('setUserEmail', user.email)
            commit('setUserUid', user.uid)
          }
          Validated()
        });
      })
    },
    //requete deposit user
    loadUserDeposit: ({commit, state}) => {
      return new Promise(Validated => {
        state.userData.deposit = 0
        getDoc(doc(db, `UserWallet/${state.userData.uid}/ListWallet/${state.userData.walletSelected}`, )).then((snapshot ) => {
         /*  console.log(snapshot.data()) */
          commit('setUserDepositSelect', snapshot.data())
        }).then(() => {
          Validated(true)
        })
      })
    },
    //requete crypto user
    loadUserCrypto: ({commit, state}, userUid) => {
      return new Promise(Validated => {
        state.userData.listCryptoUser = []
        state.userData.dataCrypto = []
        const tab = []
        var isEmpty = 0
        getDocs(collection(db, `UserCrypto/${userUid}/${state.userData.walletSelected}`)).then((snapshot) => {
          snapshot.forEach((doc) => tab[doc.id] = doc.data())
          snapshot.forEach(() => isEmpty = 1)
        }).then(() => {
          /* console.log(tab) */
          if (isEmpty != 0) {
            commit('setUserDataCrypto', tab)
            Validated(true)
          } else {
            Validated(false)
          }
        })
      })
    },
    //requete recuperation price crypto
    loadCryptoPrice: ({commit}, userCryptoList) => {
      return new Promise(Validated => {
        let list = userCryptoList.toString()
        var urlcourante = document.location.host; 
        axios({
          method: 'GET',
          url: 'http://' + urlcourante + '/v1/cryptocurrency/quotes/latest?CMC_PRO_API_KEY=3c532d3a-c0d1-415e-8d48-f15d64497835&symbol=' + list
        }).then(result => {
          commit('setActuelPrice', { 
            resultRequest: result.data.data,
          })
          Validated(true)
          },
          error => {
            Validated(error)
          }
        )
      })
    },
    //calcul winloss valeur
    loadWinLostValue: ({commit}, dataCrypto) => {
      return new Promise(Validated => {
        let tab = []
        let resultSum = 0
        for (const name in dataCrypto) {
          tab.push(parseInt((dataCrypto[name].quantity * dataCrypto[name].priceNow).toFixed(2)))
        }     
        for (var b=0; b<tab.length; b++) {
          resultSum = (resultSum+tab[b])
        }
        commit('setWinLostValue', resultSum)
        Validated(true)
      })
    },
    //requete recuperation de la liste des creypto valide du site
    loadCryptoList: ({commit}) => {
      return new Promise(Validated => {
        getDoc(doc(db, 'CryptoList', 'wpcNLNN9xWlI2bi6VvP9')).then((snapshot ) => {
          commit('setCryptoList', snapshot.data().Crypto)
        }).then(() => {
          Validated(true)
        })
      })
    },
    //delete crypto
    deleteCryptoUser: ({state}, data) => {
      return new Promise(Validated => {
        deleteDoc(doc(db, `UserCrypto/${state.userData.uid}/${state.userData.walletSelected}/${data['cryptoName']}`)).then(() => {
          Validated(true)
        })
      })
    },
    //update deposit
    updateDeposit: ({state}, data) => {
      return new Promise(Validated => {
        updateDoc(doc(db, `UserWallet/${state.userData.uid}/ListWallet/${state.userData.walletSelected}`), {
          deposit: data['deposit']
        }).then(() => {
          Validated(true)
        })
      })
    },
    //update crypto user
    updateCryptoUser: ({state}, data) => {
      return new Promise(Validated => {
        updateDoc(doc(db, `UserCrypto/${state.userData.uid}/${state.userData.walletSelected}/${data['cryptoName']}`), {
          buyPrice: data['buyprice'],
          quantity: data['quantity']
        }).then(() => {
          Validated(true)
        })
      })
    },
    //add new wallet
    AddNewWallet: ({state}, data) => {
      return new Promise(Validated => {
        if (data['walletName']) {
          setDoc(doc(db, `UserWallet/${state.userData.uid}/ListWallet/${data['walletName']}`), {
            deposit: data['deposit'], 
          })
          Validated(true)
        }      
      })
    },
    //load all user wallet
    loadUserWallet: ({state, commit}) => {
      return new Promise(Validated => {
        state.userData.walletList = []
        state.userData.depositList = []
        const tab = []
        var isEmpty = 0
        getDocs(collection(db, `UserWallet/${state.userData.uid}/ListWallet`)).then((snapshot) => {
          snapshot.forEach((doc) => tab[doc.id] = doc.data())
          snapshot.forEach(() => isEmpty = 1)
/*           snapshot.forEach(() => isEmpty = 1) */
        }).then(() => {
          if (isEmpty != 0) {
            commit('setWalletUser', tab)
            commit('setUserDepositList', tab)
            Validated(true)
          } else {
            Validated(false)
          }
          
        })
      })
    },
    //add select wallet
    selectWallet: ({commit}, value) => {
      return new Promise(Validated => {
        commit('setSelectedWallet', value)
        Validated(true)
      })
      
    },
    //delete wallet
    deleteWalletUser: ({state}, value) => {
      return new Promise(Validated => {
        deleteDoc(doc(db, `UserWallet/${state.userData.uid}/ListWallet/${value['walletName']}`)).then(() => {
          getDocs(collection(db, `UserCrypto/${state.userData.uid}/${value['walletName']}`)).then((snapshot) => {
            snapshot.forEach((docu) => deleteDoc(doc(db, `UserCrypto/${state.userData.uid}/${value['walletName']}/${docu.id}`)).then(() => {
              Validated(false)
            }))
          })
        }).then(() => {
          Validated(true)
        })
      })
    },

    //requete recuperation price crypto pour graph
    loadCryptoPriceHistoryHour: ({commit, state}) => {
      return new Promise(Validated => {
        state.historyTimeDly = ''
        state.historyWalletDly = ''
        var tabCrypto = []
        var tabTime = []
        var countUserCrypto = state.userData.listCryptoUser.length
        var count = 0
        //var tabResultFinal = []
        for (const token in state.userData.listCryptoUser) {
          //console.log(token)
          axios({
            method: 'GET',
            url: 'https://min-api.cryptocompare.com/data/v2/histohour?fsym=' + state.userData.listCryptoUser[token] + '&tsym=USD&limit=23'
          }).then(result => {
            addOnArray(result.data.Data.Data, token, countUserCrypto, count)
          })
        }
        
       
        function addOnArray(result, token, countUserCrypto) {
          var data = result 
            //parse resultat des prix qio contient 24 prix pour 24h
            if (typeof data != 'undefined') {
              //faire correspondre list crypto user avec resultat
              for (const cryptoUser in state.userData.dataCrypto) {
                //si correspondance
                if (state.userData.dataCrypto[cryptoUser].crypto == state.userData.listCryptoUser[token]) {
                  //alors parse les 24h de donner puis ajouter dans tableau en multipliant
                  for (const val in data) {
                    //console.log(data[val].open * state.userData.dataCrypto[cryptoUser].quantity)
                    if (tabCrypto[val] == null) {
                      tabCrypto[val] = Math.round(data[val].open * state.userData.dataCrypto[cryptoUser].quantity)
                      tabTime[val] = timeConverter(data[val].time)
                    } else {
                      tabCrypto[val] = Math.round(tabCrypto[val] + (data[val].open * state.userData.dataCrypto[cryptoUser].quantity))
                      tabTime[val] = timeConverter(data[val].time)
                    }
                  }
                }
              }        
            }
            count++
          if (countUserCrypto == count) {
            commit('setHistoWalletDly', {
              tabCrypto: tabCrypto,
              tabTime: tabTime
            })
            Validated(state)
          }
        }

        function timeConverter(UNIX_timestamp){
          var a = new Date(UNIX_timestamp * 1000);
          var months = ['Jan','Feb','March','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          var year = a.getFullYear();
          var month = months[a.getMonth()];
          var date = a.getDate();
          var hour = a.getHours();
          var min = a.getMinutes();
          var sec = a.getSeconds();
          var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
          return time;
        }
      })
    },

    //requete recuperation price crypto pour graph
    loadCryptoPriceHistoryWly: ({commit, state}) => {
      return new Promise(Validated => {
        state.historyTimeWky = ''
        state.historyWalletWky = ''
        var tabCrypto = []
        var tabTime = []
        var countUserCrypto = state.userData.listCryptoUser.length
        var count = 0
        //var tabResultFinal = []
        for (const token in state.userData.listCryptoUser) {
          //console.log(token)
          axios({
            method: 'GET',
            url: 'https://min-api.cryptocompare.com/data/v2/histoday?fsym=' + state.userData.listCryptoUser[token] + '&tsym=USD&limit=6'
          }).then(result => {
            addOnArray(result.data.Data.Data, token, countUserCrypto, count)
          })
        }

        function addOnArray(result, token, countUserCrypto) {
          var data = result 
            //parse resultat des prix qio contient 24 prix pour 24h
            if (typeof data != 'undefined') {
              //faire correspondre list crypto user avec resultat
              for (const cryptoUser in state.userData.dataCrypto) {
                //si correspondance
                if (state.userData.dataCrypto[cryptoUser].crypto == state.userData.listCryptoUser[token]) {
                  //alors parse les 24h de donner puis ajouter dans tableau en multipliant
                  for (const val in data) {
                    //console.log(data[val].open * state.userData.dataCrypto[cryptoUser].quantity)
                    if (tabCrypto[val] == null) {
                      tabCrypto[val] = Math.round(data[val].open * state.userData.dataCrypto[cryptoUser].quantity)
                      tabTime[val] = timeConverter(data[val].time)
                    } else {
                      tabCrypto[val] =  Math.round(tabCrypto[val] + (data[val].open * state.userData.dataCrypto[cryptoUser].quantity))
                      tabTime[val] = timeConverter(data[val].time)
                    }
                  }
                }
              }        
            }
            count++
          if (countUserCrypto == count) {
            commit('setHistoWalletWky', {
              tabCrypto: tabCrypto,
              tabTime: tabTime
            })
            Validated(state)
          }
        }

        function timeConverter(UNIX_timestamp){
          var a = new Date(UNIX_timestamp * 1000);
          var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          var year = a.getFullYear();
          var month = months[a.getMonth()];
          var date = a.getDate();
          var time = date + ' ' + month + ' ' + year + ' ';
          return time;
        }
      })
    },

    //requete recuperation price crypto pour graph
    loadCryptoPriceHistoryMth: ({/* commit */ state}) => {
      return new Promise(Validated => {
        var tab = []
        //var tabResultFinal = []
        for (const token in state.userData.listCryptoUser) {
          //console.log(token)
          axios({
            method: 'GET',
            url: 'https://min-api.cryptocompare.com/data/v2/histohour?fsym=' + state.userData.listCryptoUser[token] + '&tsym=USD&limit=23'
          }).then(result => {
            var data = result.data.Data.Data    
            //parse resultat des prix qio contient 24 prix pour 24h
            if (typeof data != 'undefined') {
              //faire correspondre list crypto user avec resultat
              for (const cryptoUser in state.userData.dataCrypto) {
                //si correspondance
                if (state.userData.dataCrypto[cryptoUser].crypto == state.userData.listCryptoUser[token]) {
                  //alors parse les 24h de donner puis ajouter dans tableau en multipliant
                  for (const val in data) {
                    //console.log(data[val].open * state.userData.dataCrypto[cryptoUser].quantity)
                    if (tab[val] == null) {
                      tab[val] = data[val].open * state.userData.dataCrypto[cryptoUser].quantity
                    } else {
                      tab[val] = tab[val] + (data[val].open * state.userData.dataCrypto[cryptoUser].quantity)
                    }
                  }
                }
              }        
            }
          })
        }
        console.log(tab)
        Validated(state)
      })
    },
  },
  modules: {},
});


/*.then(result => {
            var data = result.data.Data.Data    
            //parse resultat des prix qio contient 24 prix pour 24h
            if (typeof data != 'undefined') {
              //faire correspondre list crypto user avec resultat
              for (const cryptoUser in state.userData.dataCrypto) {
                //si correspondance
                if (state.userData.dataCrypto[cryptoUser].crypto == state.userData.listCryptoUser[token]) {
                  //alors parse les 24h de donner puis ajouter dans tableau en multipliant
                  for (const val in data) {
                    //console.log(data[val].open * state.userData.dataCrypto[cryptoUser].quantity)
                    if (tab[val] == null) {
                      tab[val] = data[val].open * state.userData.dataCrypto[cryptoUser].quantity
                    } else {
                      tab[val] = tab[val] + (data[val].open * state.userData.dataCrypto[cryptoUser].quantity)
                    }
                  }
                }
              }        
            }
          })*/



/*
    //test ascyncro
    test: ({commit}) => {
      commit;
      var resolveAfter2Seconds = function() {
        console.log("Initialisation de la promesse lente");
        return new Promise(resolve => {
          setTimeout(function() {
            resolve("lente");
            console.log("La promesse lente est terminée");
          }, 2000);
        });
      };
      var resolveAfter1Second = function() {
        console.log("Initialisation de la promesse rapide");
        return new Promise(resolve => {
          setTimeout(function() {
            resolve("rapide");
            console.log("La promesse rapide est terminée");
          }, 1000);
        });
      };
      var concurrentPromise = function() {
        console.log('==Début concurrentiel avec Promise.all==');
        return Promise.all([resolveAfter2Seconds(), resolveAfter1Second()]).then((messages) => {
          console.log(messages[0]); // lente
          console.log(messages[1]); // rapide
        });
      }
      concurrentPromise()
    }
*/

/* crypto : {
  btc: {
    buyprice: 54 000,
    quantity: 2,
  },
  egld: {
    buyprice: 54 000,
    quantity: 2,
  },
} */



/* function bite (namecrypto) {
  let namecrypto = namecrypto['crypto']
  let toAdd : {
    buyprice: namecrypto['buyprice'],
    quantity: namecrypto['quantity'],
  }
} */
