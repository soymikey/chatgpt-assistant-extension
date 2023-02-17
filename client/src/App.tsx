import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

import { Button, Input } from "antd";
import type { InputRef } from "antd";

import "antd/dist/reset.css";
import "./App.css";

const { TextArea } = Input;

const PLUSSYMBOL = "+";
const lighlightContent = window!.getSelection()!.toString();
function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<InputRef>(null);

  const [content, setContent] = useState("");
  const [response, setResponse] = useState("");
  const [highlightContent] = useState(lighlightContent);
  const [shortcutList, setShortcutList] = useState([
    { value: "1" },
    { value: "2" },
    { value: "3" },
    { value: PLUSSYMBOL },
  ]);

  function outsideClick() {
    appRef.current!.remove();
  }

  function insideClick(e: any) {
    e.stopPropagation();
    console.log("inside clicked ");
  }

  function shortcutClickHandler(value: string) {
    if (value === PLUSSYMBOL) {
      return;
    }
    setContent(value);
    inputRef.current!.focus();
  }
  function inputChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setContent(value);
  }
  function inputEnterHandler() {
    console.log("发送请求");
    getAnswer();
  }

  async function getAnswer() {
    try {
      const response = await axios.get(
        `http://localhost:3001?input=${content}&content=${highlightContent}`
      );
      setResponse(response.data);
    } catch (error) {
      console.error(error);
    }
  }
  async function updateShortcutList() {
    try {
      await axios.post(`http://localhost:3001/update`, {
        shortcutList,
      });
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    updateShortcutList();
  }, []);

  useEffect(() => {}, []);
  return (
    <div className="App" ref={appRef} onClick={outsideClick}>
      <div className="modal" onClick={insideClick}>
        <div className="header">header</div>
        <div className="content">
          <div className="user-input">
            <Input
              size="large"
              placeholder="large size"
              ref={inputRef}
              value={content}
              onChange={inputChangeHandler}
              onPressEnter={inputEnterHandler}
            />
          </div>
          <div className="input-shortcut">
            {shortcutList.map((i) => {
              return (
                <Button
                  type="primary"
                  onClick={() => shortcutClickHandler(i.value)}
                >
                  {i.value}
                </Button>
              );
            })}
          </div>
          <div className="select-content-area">
            <TextArea
              rows={4}
              value={highlightContent}
              readOnly
              placeholder="这里放高亮的内容"
              maxLength={6}
            />
          </div>
          <div className="textarea">
            <TextArea
              rows={4}
              value={response}
              readOnly
              placeholder="这个是chatGPT返回的内容"
              maxLength={6}
            />
          </div>
        </div>
        <div className="footer">footer</div>
      </div>
    </div>
  );
}

export default App;
