import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { CloseCircleOutlined } from "@ant-design/icons";
import { Button, Input, Spin, Avatar, List } from "antd";
import type { InputRef } from "antd";

import "antd/dist/reset.css";
import "./App.css";

const { TextArea } = Input;

const HIGHLIGHTCONTENT = window!.getSelection()!.toString().trim();

function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<InputRef>(null);

  const [content, setContent] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [highlightContent] = useState(HIGHLIGHTCONTENT);
  const [shortcutList, setShortcutList] = useState([
    {
      id: "1",
      isEdit: false,
      title:
        "Ant1Ant1Ant1Ant1Ant1Ant1Ant1Ant1Ant1Ant1Ant1Ant1Ant1Ant1Ant1Ant1Ant1Ant1Ant1Ant1Ant1",
    },
    {
      id: "2",
      isEdit: false,
      title: "Ant Design Title 2",
    },
    { id: "3", isEdit: false, title: "Ant Design Title 3" },
    { id: "4", isEdit: false, title: "Ant Design Title 4" },
  ]);

  function removeApp() {
    appRef.current!.remove();
  }

  function insideClick(e: any) {
    e.stopPropagation();
    console.log("inside clicked ");
  }

  function shortcutClickHandler(value: string) {
    setContent(value);
    inputRef.current!.focus();
  }
  function inputChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setContent(value);
  }
  function inputEnterHandler() {
    console.log("发送请求");
    fetchAnswer();
  }

  async function fetchAnswer() {
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
  async function fetchShortcutList() {
    // try {
    //   setLoading(true);
    //   const response = await axios.get(
    //     `http://localhost:3001?input=${content}&content=${highlightContent}`
    //   );
    //   setResponse(response.data);
    // } catch (error) {
    //   console.error(error);
    // } finally {
    //   setLoading(false);
    // }
  }
  async function saveShortcutList() {
    setTimeout(() => {
      setIsEdit(false);
    }, 1000);
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
          {!isEdit ? (
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
              <div className="input-shortcut-wrapper">
                <div className="input-shortcut">
                  {shortcutList.map((i) => {
                    return (
                      <Button
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
                  <Button type="link" onClick={() => setIsEdit(true)}>
                    Edit
                  </Button>
                </div>
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
                          let shortcutList_ = [];
                          if (item.isEdit) {
                            shortcutList_ = shortcutList.map((s) => {
                              s.isEdit = false;

                              return s;
                            });
                          } else {
                            shortcutList_ = shortcutList.map((s) => {
                              if (s.id === item.id) {
                                s.isEdit = true;
                              } else {
                                s.isEdit = false;
                              }
                              return s;
                            });
                          }
                          setShortcutList(shortcutList_);
                        }}
                      >
                        {item.isEdit ? "Finish" : "Edit"}
                      </Button>,
                      <Button
                        type="link"
                        size="small"
                        danger
                        onClick={() => {
                          const index = shortcutList.findIndex(
                            (d) => d.id === item.id
                          );
                          shortcutList.splice(index, 1);
                          setShortcutList([...shortcutList]);
                        }}
                      >
                        Delete
                      </Button>,
                    ]}
                  >
                    {!item.isEdit ? (
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
          <div className="footer">
            {isEdit && (
              <div className="footer-button-wrapper">
                <Button type="primary" onClick={saveShortcutList}>
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
