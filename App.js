import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, 
  TouchableOpacity ,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Pressable,
  TextInput,
  ScrollView,
  
  } from 'react-native';
import {useState, useEffect, useRef} from "react";
import { theme } from './colors';
import { Fontisto } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
const STORAGE_KEY="@toDos";
const STORAGE_WORK = "@Work"
let prevEditNum = 0;
export default function App() {
  const textInputRef = useRef(null);
  const [working, setWorking] = useState(true); 
  const [ text, setText ] = useState("");
  const [toDos, setToDos] = useState({});
  const [first , setFirst] = useState(true);
  const [edit, setEdit] =useState(false);
  const [editText, setEditText] = useState("");
  const onChangeText = (payload) => setText(payload);


  const travel = async () => {
    setWorking(false); 
    saveWorking(false);

  }
  const work = async () => {
    setWorking(true);
    saveWorking(true);
  }; 

  useEffect(async () => {
    const initialize = async () => {
      try {
        await loadToDos();
        await loadWorking();
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    initialize();
    // cleanup 함수
    console.log("1");


  }, []);

  const saveWorking = async (save) => {
    
    try {
      console.log( JSON.stringify(working));
      await AsyncStorage.setItem(STORAGE_WORK, JSON.stringify(save));
    } catch (error) {
      console.error('Failed to save working status:', error);
    }
  };

const loadWorking = async () => {
  try{
  const newWorking = await AsyncStorage.getItem(STORAGE_WORK);
  if(newWorking !== null){
    setWorking(JSON.parse(newWorking));
    console.log(newWorking);
  } 
}catch(e) {
  console.log(e);
}

}
const loadToDos = async () => {
  try {
  const newArray = await AsyncStorage.getItem(STORAGE_KEY)
  if(newArray !== null) {
  setToDos(JSON.parse(newArray));
  }
  } catch (error){
    console.log(error);
  }
}
const deleteToDos = async(key) => {
  try{
  const newToDos = {...toDos}
  delete newToDos[key];
  setToDos(newToDos) ;
  console.log(newToDos);
  await savedToDos(newToDos);
  } catch(e){
    console.log(e);
  }
}
const focusTextInput = () => { 
  console.log("focus")
  if(textInputRef.current) {
    textInputRef.current.focus();
  }
}
  const savedToDos = async(toSave) => {
    try{
    await AsyncStorage.setItem(STORAGE_KEY,  JSON.stringify(toSave));
    } catch (e){
      console.log(e);
    }
  }
  const handleDone = (key) => {
    const newArray = {...toDos}; 
    newArray[key].done = !newArray[key].done; 
    savedToDos(newArray);
    setToDos(newArray);
    
  }
  const addToDo = async () => { 
    if(text === "") {
      return ;
    } 
    const newToDos = {...toDos ,[Date.now()] : {text, working:working,done:false, editing:false} };
    try{
    setToDos(newToDos);
    setText("");
    console.log(newToDos);
    await savedToDos(newToDos);
  } catch(e){
    console.log(e);
  }

  }
  const onChangeEditText = (payload) =>{
    setEditText(payload);
  }
  const editToDos = (key) => {
    const newArray = {...toDos}; 
    newArray[key].text = editText; 
    setEditText("");
    handleEditing(key);
  }
  const submitEditText = () => {
    setText(editText);
    setEditText("");
  }
  const handleEditing = (key) => {
    let newArray = {...toDos};
    
    prevEditNum === 0 ? null : newArray[prevEditNum].editing = false;
    prevEditNum === key ? null : newArray[key].editing = !newArray[key].editing
    setToDos(newArray);
    console.log(prevEditNum);
    prevEditNum=key;
   
    
  }

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
        <Text style={{...styles.btnText, color : working ? "white" : theme.grey}}>
          Work
          </Text>
    
        </TouchableOpacity>
        <Pressable onPress={travel}>
        <Text style={{...styles.btnText, color : !working ? "white" : theme.grey}}>Travel</Text>
        </Pressable>
      </View>

        <TextInput 
        onSubmitEditing={addToDo}
         keyboardType="email-address"
         autoCapitalize="none"       // 대문자 자동 전환 비활성화
         autoCorrect={false}
         
         
        onChangeText={onChangeText}
        value={text}
        style ={styles.input}
        placeholder={working ? "Add a To Do": "where do you wanna go?"} 
    />
      
    <ScrollView>{Object.keys(toDos).map(key => 
      toDos[key].working === working ?       
      (
      <View key={key} style={styles.toDos}>
      {toDos[key].editing ? (
 <TextInput 
 ref={textInputRef}
 onSubmitEditing={() => editToDos(key)}
  autoCapitalize="none"       // 대문자 자동 전환 비활성화
  autoCorrect={false}
 onChangeText={onChangeEditText}
 value={editText}
 style ={styles.editInput}
 autoFocus={true}
/>
      ) : (
        <Text style={ toDos[key].done ? styles.toDoTextDone : styles.toDoText}>{toDos[key].text}</Text>        
      )}
      
      <View style={styles.toDosIcon} >
     
      <TouchableOpacity onPress={() => {
        handleEditing(key)

      }}>
        <Text style={styles.Icon} ><FontAwesome name="pencil" size={20} /></Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDone(key)}>
        <Text style={styles.Icon} ><Fontisto name="check" size={20}  /></Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteToDos(key)}>
        <Text style={styles.Icon}>
        <Fontisto name="trash" size={20}  />
        </Text>
      </TouchableOpacity>
      </View>
      </View>
      )
      : null
    

    )}</ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header:{
    justifyContent:"space-between",
    flexDirection:"row",
    marginTop:50
  },
  btnText:{
    fontSize: 44,
    fontWeight: "600",
    color: "white"
  },
  editInput:{
    fontSize:18, 
    backgroundColor:"white",
    borderRadius:50,
    flex:1,
    paddingHorizontal:20,
  },
  input : { 
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal:20,
    borderRadius:20,
    marginTop: 20,
    marginVertical: 20,
    fontSize: 18,
  },
  toDos: {
    backgroundColor:theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection:"row", 
    justifyContent:"space-between"
  },
  toDoText: {
    color:"white",
    fontSize: 16,
    fontWeight: "500",
  },
  toDoTextDone:{
    color:theme.grey,
    textDecorationLine: 'line-through',
    fontSize: 16,
    fontWeight: "500",
  },
  toDosIcon : { 
    flexDirection: "row",
    justifyContent: "flex-end",
    margin:10
  },
  Icon:{
    fontSize: 20, 
    marginRight:10,
    color: theme.grey
    
  }
  
  
});
