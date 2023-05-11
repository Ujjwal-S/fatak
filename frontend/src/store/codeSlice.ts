import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CodeSlice } from "./types";

const initialState:CodeSlice = {
    activeCodingLanguage: "python",
    userInput: "",
    codeExecuting: false,
    activeCodingLanguageIcon: {
        "cpp": "https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_cpp3.svg",
        "javascript": "https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_js_official.svg",
        "python": "https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_python.svg",
        "go": "https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_go.svg",
        "java": "https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_java.svg",
        "rust": "https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_light_rust.svg",
        "sql": "https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_sql.svg"
    },
    code: "",
    output: ""
}

const codeSlice = createSlice({
    name: 'codeSlice',
    initialState,
    reducers: {
        updateUserInput: (state, action: PayloadAction<string>) => {
            state.userInput = action.payload
        },
        updateCodeExecutionStatus: (state, action: PayloadAction<boolean>) => {
            state.codeExecuting = action.payload
        },
        updateLanguage: (state, action) => {
            state.activeCodingLanguage = action.payload
        },
        updateCode: (state, action) => {
            state.code = action.payload
        },
        updateOuput: (state, action) => {
            state.output = action.payload
            state.codeExecuting = false
        }
    }
})

export const {updateUserInput, updateCodeExecutionStatus, updateLanguage, updateCode, updateOuput} = codeSlice.actions
export default codeSlice.reducer