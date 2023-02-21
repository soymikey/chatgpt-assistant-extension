import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  CloseCircleOutlined,
  SyncOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { Button, Input, Spin, List, Divider } from "antd";
import type { InputRef } from "antd";

// import "antd/dist/reset.css";
import "./App.css";

const { TextArea } = Input;

const fetch = axios.create({
  baseURL: "http://localhost:3001/api/",
  timeout: 5000,
  headers: { "X-Requested-With": "XMLHttpRequest" },
});

const HIGHLIGHTCONTENT = window.getSelection()?.toString()?.trim() || "";
const HOMETITLE = "ChatGPT Assistant";
const EDITTITLE = "Edit/Add prompt";
type ShortcutType = { id: string; title: string };
type ResponseType = { errno: number; data: any };
type UserInfoType = { username: string; userId: string };

function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<InputRef>(null);

  const [title, setTitle] = useState(HOMETITLE);
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false); //是否在剪辑快捷键
  const [editId, setEditId] = useState("");

  const [userInfo, setUserInfo] = useState<UserInfoType>({
    username: "",
    userId: "",
  });
  const [highlightContent, setHighlightContent] = useState(HIGHLIGHTCONTENT);
  const [shortcutList, setShortcutList] = useState<ShortcutType[]>([]);

  function onChangeHighlightedContext(
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    const value = e.target.value;
    setHighlightContent(value);
  }
  function removeApp() {
    appRef.current!.remove();
  }

  function insideClick(e: any) {
    e.stopPropagation();
  }

  async function getUserInfo() {
    try {
      const { data } = await fetch.post<ResponseType>(`/getUser`, {
        userId: "123",
      });
      if (data.errno === -1) {
        return;
      }
      const { username, userId, shortcutList = [] } = data.data;
      setUserInfo({ username, userId });
      setShortcutList(shortcutList);
    } catch (error) {
      console.error(error);
    }
  }

  function shortcutClickHandler(value: string) {
    setUserInput(value);
    inputRef.current!.focus();
  }

  function inputChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUserInput(value);
  }

  function inputEnterHandler() {
    console.log("发送请求");
    fetchAnswer();
  }

  async function fetchAnswer() {
    try {
      setLoading(true);
      const { data } = await fetch.post<ResponseType>("/getAnswer", {
        userInput,
        highlightContent,
      });
      setResponse(data.data.text);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function onChangeShortcutHandler(
    e: React.ChangeEvent<HTMLInputElement>,
    item: any
  ) {
    const value = e.target.value;

    const id = item.id;
    const index = shortcutList.findIndex((s) => s.id === id);
    shortcutList[index].title = value;
    setShortcutList([...shortcutList]);
  }

  function truncateString(str: string, num: number) {
    if (str.length > num) {
      return str.substring(0, num) + "...";
    } else {
      return str;
    }
  }

  function uuidv4() {
    // @ts-ignore: Unreachable code error

    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: any) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
  }

  function onAddPromte() {
    const hasEmptyValue =
      shortcutList.filter((i) => !i.title.trim()).length > 0;

    if (hasEmptyValue) return;
    const id = uuidv4();
    setShortcutList([...shortcutList, { id, title: "" }]);
    setEditId(id);
  }
  function onShortcutItemEdit(id: string) {
    if (editId === id) {
      setEditId("");
    } else {
      setEditId(id);
    }
  }
  function onShortcutItemDelete(id: string) {
    const index = shortcutList.findIndex((d) => d.id === id);
    shortcutList.splice(index, 1);
    setShortcutList([...shortcutList]);
  }
  async function onShortcutComplete() {
    setEditId("");
    const shortcutList_ = shortcutList.filter((i) => i.title.trim());
    setShortcutList(shortcutList_);
    const { data } = await fetch.post<ResponseType>(`/updateUser`, {
      userId: userInfo.userId,
      shortcutList: shortcutList_,
    });

    if (data.errno === 0) {
      setIsEdit(false);
      setTitle(HOMETITLE);
    }
  }

  function onEditHandler() {
    setIsEdit(true);
    setTitle(EDITTITLE);
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(response);
  }
  useEffect(() => {
    getUserInfo();
  }, []);

  return (
    <div className="assistant-app" ref={appRef} onMouseDown={removeApp}>
      <div className="assistant-modal" onMouseDown={insideClick}>
        <Spin spinning={loading}>
          <div className="assistant-header">
            <div className="assistant-header-left"></div>
            <div className="assistant-header-content">{title}</div>
            <CloseCircleOutlined
              style={{ fontSize: "20px" }}
              onClick={removeApp}
            />
          </div>
          <Divider style={{ margin: "5px 0px" }} />

          {!isEdit ? (
            <div className="assistant-content">
              <div className="user-input">
                <Input
                  size="large"
                  placeholder="Ask Assistant. Ex: Write an email reply in yoda style"
                  ref={inputRef}
                  value={userInput}
                  onChange={inputChangeHandler}
                  onPressEnter={inputEnterHandler}
                />
              </div>
              <div className="input-shortcut-wrapper">
                <div className="input-shortcut">
                  {shortcutList.map((i) => {
                    return (
                      <Button
                        key={i.id}
                        type="primary"
                        style={{ marginRight: "10px", marginBottom: "5px" }}
                        onClick={() => shortcutClickHandler(i.title)}
                      >
                        {truncateString(i.title, 8)}
                      </Button>
                    );
                  })}
                </div>

                <div className="input-shortcut-edit">
                  <Button type="link" onClick={onEditHandler}>
                    {shortcutList.length ? "Edit" : "Add"}
                  </Button>
                </div>
              </div>

              {highlightContent ? (
                <div className="highlight-content-area">
                  <Divider style={{ margin: "5px 0px" }} />
                  <div className="highlight-content-area-title">
                    <div className="highlight-content-area-left">
                      Highlighted Context:
                    </div>
                    <div className="highlight-content-area-right"></div>
                  </div>
                  <TextArea
                    value={highlightContent}
                    onChange={onChangeHighlightedContext}
                    placeholder="这里放高亮的内容"
                  />
                </div>
              ) : null}
              <div className="assistant-textarea">
                <Divider style={{ margin: "5px 0px" }} />
                <div className="assistant-textarea-title">
                  <div className="assistant-textarea-title-left">
                    {HOMETITLE} Says:
                  </div>
                  <div className="assistant-textarea-title-right">
                    <SyncOutlined onClick={fetchAnswer} />
                    <CopyOutlined onClick={copyToClipboard} />
                  </div>
                </div>
                <TextArea
                  ref={textareaRef}
                  rows={8}
                  value={response}
                  readOnly
                  placeholder="Type your question above and press enter"
                />
              </div>
            </div>
          ) : (
            <div className="assistant-shortcut-list">
              <List
                itemLayout="horizontal"
                dataSource={shortcutList}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        type="link"
                        size="small"
                        onClick={() => {
                          onShortcutItemEdit(item.id);
                        }}
                      >
                        {editId === item.id ? "Finish" : "Edit"}
                      </Button>,
                      <Button
                        type="link"
                        size="small"
                        danger
                        onClick={() => {
                          onShortcutItemDelete(item.id);
                        }}
                      >
                        Delete
                      </Button>,
                    ]}
                  >
                    {editId !== item.id ? (
                      <List.Item.Meta
                        title={
                          <div className="shortcut-item">{item.title}</div>
                        }
                      />
                    ) : (
                      <Input
                        placeholder="Add your Shortcut"
                        value={item.title}
                        onChange={(e) => onChangeShortcutHandler(e, item)}
                      />
                    )}
                  </List.Item>
                )}
              />
            </div>
          )}
          <Divider style={{ margin: "5px 0px" }} />

          <div className="assistant-footer">
            {isEdit && (
              <div className="footer-button-wrapper">
                <Button onClick={onAddPromte}>Add Prompt</Button>
                <Button type="primary" onClick={onShortcutComplete}>
                  Complete
                </Button>
              </div>
            )}
          </div>
        </Spin>
      </div>
    </div>
  );
}

export default App;
