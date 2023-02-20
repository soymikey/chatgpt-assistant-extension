import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { CloseCircleOutlined } from "@ant-design/icons";
import { Button, Input, Spin } from "antd";
import type { InputRef } from "antd";

import "antd/dist/reset.css";
import "./App.css";

const { TextArea } = Input;

const PLUSSYMBOL = "+";
const HIGHLIGHTCONTENT = window!.getSelection()!.toString().trim();
function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<InputRef>(null);

  const [content, setContent] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [highlightContent] = useState(HIGHLIGHTCONTENT);
  const [shortcutList, setShortcutList] = useState([
    { value: "1" },
    { value: "2" },
    { value: "3" },
    { value: PLUSSYMBOL },
  ]);

  function removeApp() {
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
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3001?input=${content}&content=${highlightContent}`
      );
      setResponse(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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

  return (
    <div className="assistant-app" ref={appRef} onMouseDown={removeApp}>
      <div className="assistant-modal" onMouseDown={insideClick}>
        <Spin spinning={loading}>
          <div className="header">
            <CloseCircleOutlined
              style={{ fontSize: "20px" }}
              onClick={removeApp}
            />
          </div>
          <div className="content">
            <div className="user-input">
              <Input
                size="large"
                placeholder="Ask Assistant. Ex: Write an email reply in yoda style"
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
            {highlightContent ? (
              <div className="highlight-content-area">
                <TextArea
                  value={highlightContent}
                  readOnly
                  placeholder="这里放高亮的内容"
                  maxLength={8}
                />
              </div>
            ) : null}
            <div className="assistant-textarea">
              <TextArea
                rows={8}
                value={response}
                readOnly
                placeholder="这个是chatGPT返回的内容"
              />
            </div>
          </div>
          <div className="footer">footer</div>
        </Spin>
      </div>
    </div>
  );
}

export default App;
