import React, { useEffect, useRef, useState } from "react";
import {
  CloseCircleOutlined,
  SyncOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { Button, Input, Spin, List, Divider } from "antd";
import type { InputRef } from "antd";
import {
  HIGHLIGHTCONTENT,
  HOMETITLE,
  EDITTITLE,
  CHATAPIERROR,
} from "./constant";

import "./App.css";
import { CustomResponseType, ShortcutType, UserInfoType } from "./type";
import { copyToClipboard, truncateString, uuidv4 } from "./tools";
import API from "./baseApi";

const { TextArea } = Input;

function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<InputRef>(null);

  const [title, setTitle] = useState(HOMETITLE); //标题
  const [userInput, setUserInput] = useState(""); //用户输入
  const [answer, setAnswer] = useState(""); //答案
  const [loading, setLoading] = useState(false); //请求加载中
  const [isEdit, setIsEdit] = useState(false); //是否在剪辑快捷键
  const [editId, setEditId] = useState(""); //编辑的快捷键id

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
    appRef.current?.remove();
  }

  function insideClick(e: any) {
    e.stopPropagation();
  }

  async function getUserInfo() {
    try {
      const { data } = await API.post<CustomResponseType>(`/getUser`, {
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

  async function fetchAnswer() {
    try {
      setLoading(true);
      const { data } = await API.post<CustomResponseType>("/getAnswer", {
        userInput,
        highlightContent,
      });
      setAnswer(data.data.text);
    } catch (error) {
      setAnswer(CHATAPIERROR);
    } finally {
      setLoading(false);
    }
  }

  function onChangeShortcutItemHandler(
    e: React.ChangeEvent<HTMLInputElement>,
    item: any
  ) {
    const value = e.target.value;

    const id = item.id;
    const index = shortcutList.findIndex((s) => s.id === id);
    shortcutList[index].title = value;
    setShortcutList([...shortcutList]);
  }

  function onAddPromteHandler() {
    const hasEmptyValue =
      shortcutList.filter((i) => !i.title.trim()).length > 0;

    if (hasEmptyValue) return;
    const id = uuidv4();
    setShortcutList([...shortcutList, { id, title: "" }]);
    setEditId(id);
  }

  function onShortcutItemEditHandler(id: string) {
    if (editId === id) {
      setEditId("");
    } else {
      setEditId(id);
    }
  }
  function onShortcutItemDeleteHandler(id: string) {
    const index = shortcutList.findIndex((d) => d.id === id);
    shortcutList.splice(index, 1);
    setShortcutList([...shortcutList]);
  }
  async function onShortcutCompleteHandler() {
    setEditId("");
    const shortcutList_ = shortcutList.filter((i) => i.title.trim());
    setShortcutList(shortcutList_);
    const { data } = await API.post<CustomResponseType>(`/updateUser`, {
      userId: userInfo.userId,
      shortcutList: shortcutList_,
    });

    if (data.errno === 0) {
      setIsEdit(false);
      setTitle(HOMETITLE);
    }
  }

  function onClickEditItemHandler() {
    setIsEdit(true);
    setTitle(EDITTITLE);
  }

  useEffect(() => {
    getUserInfo();
  }, []);

  return (
    <div id="chatgpt-assistant-app" ref={appRef} onMouseDown={removeApp}>
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
                  onPressEnter={fetchAnswer}
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
                  <Button type="link" onClick={onClickEditItemHandler}>
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
                    <CopyOutlined onClick={() => copyToClipboard(answer)} />
                  </div>
                </div>
                <TextArea
                  ref={textareaRef}
                  rows={8}
                  value={answer}
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
                          onShortcutItemEditHandler(item.id);
                        }}
                      >
                        {editId === item.id ? "Finish" : "Edit"}
                      </Button>,
                      <Button
                        type="link"
                        size="small"
                        danger
                        onClick={() => {
                          onShortcutItemDeleteHandler(item.id);
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
                        onChange={(e) => onChangeShortcutItemHandler(e, item)}
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
                <Button onClick={onAddPromteHandler}>Add Prompt</Button>
                <Button type="primary" onClick={onShortcutCompleteHandler}>
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
