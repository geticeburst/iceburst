import axios from "axios";



const url ="https://iceburst.probietech.com/v1/"
const urlLocal ="http://localhost:8000/v1/"

const instance = axios.create({baseURL: url });
// const accessToken =  localStorage.getItem("accessToken");

// axios.defaults.baseURL = url
// instance.defaults.headers['ApiKey'] = key;
 instance.defaults.headers['Cache-Control'] = "no-cache";
//  instance.defaults.headers["Authorization"] = "Bearer " + accessToken;


export default instance;