import { useState, useEffect, useRef } from 'react';
import { message, Upload, Popover, Modal } from 'antd';
import marked from 'marked';
import hljs from 'highlight.js';
import './highlight.css';
import './index.css';
import bold from './icon/bold.svg'
import code from './icon/code.svg'
import link from './icon/link.svg'
import list from './icon/list.svg'
import save from './icon/save.svg'
import title from './icon/title.svg'
// import preview from './icon/preview.svg'
import submit from './icon/submit.svg'
import upload from './icon/upload.svg'
import image from './icon/image.svg'
import split from './icon/split.svg'
import cite from './icon/cite.svg'
import file from './icon/filelist.svg'
import h2 from './icon/h2.svg'
const fileApi = 'http://116.62.220.126:2333/api/file/upload'

const Marked = (props) => {
    const [text, setText] = useState(''); 
    const [showText, setShowText] = useState(''); 
    const edit = useRef(null)  // 编辑区元素
    const show = useRef(null)  // 展示区元素
    const [begin, setBegin] = useState(0)
    const [end, setEnd] = useState(0)
    const [fileList, setFileList] = useState([])
    const [showlist, setShowlist] = useState(false)
    let scrolling = 0 
    let scrollTimer
    // 每个按键应该让光标缩进的格子
    let indent = [2,2,3,2,6,2,6]

    useEffect(() => {
        // 配置highlight
        hljs.configure({
            tabReplace: '',
            classPrefix: 'hljs-',
            languages: ['CSS', 'HTML', 'JavaScript', 'Python', 'TypeScript', 'Markdown'],
        });
        // 配置marked
        marked.setOptions({
            renderer: new marked.Renderer(),
            highlight: code => hljs.highlightAuto(code).value,
            gfm: true, //默认为true。 允许 Git Hub标准的markdown.
            tables: true, //默认为true。 允许支持表格语法。该选项要求 gfm 为true。
            breaks: true, //默认为false。 允许回车换行。该选项要求 gfm 为true。
        });
        let content = window.sessionStorage.getItem('content')
        // console.log(content);
        if (content) {
            document.getElementById("mark").value = content
            setText(content);
        }
    }, []);

    useEffect(() => {
        setShowText(marked(text).replace(/<pre>/g, "<pre id='hljs'>"));
    }, [text])

    const addMark = (e,type = 2) =>{
        // console.log(text,begin,end,e);
        let mark = document.getElementById("mark")
        if (begin === end){ // 光标未选中内容时
            mark.value = text.slice(0,begin) + e + text.slice(end) 
            mark.setSelectionRange(begin+indent[type],begin+indent[type]);
            mark.focus()
        } else { // 当光标选中内容后
            if (!type) { 
                mark.value = text.slice(0,begin) + '**' + text.slice(begin,end) + '** ' + text.slice(end)
                mark.setSelectionRange(begin+indent[type],end+indent[type]);
                mark.focus()
            }
            else {
                if (text[begin-1] === '\n' || begin === 0 ){ //当不需要另起一行的时候
                    mark.value = text.slice(0,begin) + e + text.slice(begin,end) + text.slice(end)
                    mark.setSelectionRange(begin+indent[type],end+indent[type]);
                }else{
                    mark.value = text.slice(0,begin) + '\n' + e + text.slice(begin,end) + text.slice(end)
                    mark.setSelectionRange(begin+indent[type]+1,end+indent[type]+1);
                }
                mark.focus()
            }
        }
    }

    const addLink = ()=> {
        let mark = document.getElementById("mark")
        mark.value = text.slice(0,begin) + '[添加链接描述](添加网页url地址)\n' + text.slice(end)
        mark.setSelectionRange(begin+1,begin+7);
        mark.focus()
    }

    const saveMark = ()=>{
        message.success('保存成功');
    }

    function submitMark() {
        setShowlist(false)
        Modal.confirm({
            title: '提示',
            content: '您真的要提交吗，一旦提交不可再次修改',
            onOk() {message.success('提交成功');},
            cancelText : '取消',
            okText:'确定',
            afterClose() {setShowlist(true)},
            closable: true,
        });
    }

    function deleteFile(file) {
        setShowlist(false)
        Modal.confirm({
            title: '提示',
            content: `真的要删除${file.name}吗?`,
            onOk() {setFileList(fileList.filter((obj)=>file.uid!==obj.uid));message.success('删除成功');},
            cancelText : '取消',
            okText:'确定',
            afterClose() {setShowlist(true)},
            closable: true,
        });
    }

    const updatePoint = (e) =>{
        // console.log(e.target.selectionStart);
        var value=document.getElementById("mark").value;
        setText(value);
        window.sessionStorage.setItem('content',value)
        setBegin(e.target.selectionStart)
        setEnd(e.target.selectionEnd)
    }

    const content = (
        <div><Upload style={{cursor:'pointer'}} fileList={fileList} onRemove={(file)=>{deleteFile(file)}} /></div>
      );

      const handleScroll = (block, event) => {
        let { scrollHeight, scrollTop, clientHeight } = event.target
        let scale = scrollTop / (scrollHeight - clientHeight)  // 改进后的计算滚动比例的方法
        if(block === 1) {
            if(scrolling === 0) scrolling = 1;  
            if(scrolling === 2) return;    
            driveScroll(scale, show.current)  
        } else if(block === 2) {  
            if(scrolling === 0) scrolling = 2;
            if(scrolling === 1) return;    
            driveScroll(scale, edit.current)
        }
    }

    // 驱动一个元素进行滚动
    const driveScroll = (scale, el) => {
        let { scrollHeight, clientHeight } = el
        el.scrollTop = (scrollHeight - clientHeight) * scale  // scrollTop的同比例滚动
        if(scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            scrolling = 0   
            clearTimeout(scrollTimer)
        }, 200)
    }

    return (
        <div style={{display:'flex',justifyContent:'center',paddingTop:'20px'}} >
        <div className='g-marked'>
            <div className="m-toolbar" >
                <ul>
                    <li onClick={() => addMark('****',0)} ><button><img src={bold} alt='' />加粗</button></li>
                    <li onClick={() => addMark('# ',1)} ><button><img src={title} alt='' />标题</button></li>
                    <li onClick={() => addMark('## ',2)} ><button><img src={h2} alt='' />二级</button></li>
                    <li onClick={() => addMark('- ',3)} ><button><img src={list} alt='' />列表</button></li>
                    <li onClick={() => addMark('\n\n---\n',4)} ><button><img src={split} alt='' />分割线</button></li>
                    <li onClick={() => addMark('> ',5)} ><button><img src={cite} alt='' />引用</button></li>
                    <li onClick={() => addMark('\n``` \n\n```\n',6)} ><button><img src={code} alt='' />代码块</button></li>
                    <li>|</li>
                    <li onClick={() => {addLink()}} ><button><img src={link} alt='' />链接</button></li>
                    <li onClick={() => {}} ><button><img src={image} alt='' />图片</button></li>
                    <li>|</li>
                    {/* <li onClick={() => addMark()} ><button><img src={preview} alt='' />预览</button></li> */}
                    <Upload
                            action={fileApi}
                            // accept='.zip'
                            // beforeUpload={ (file,filelist) => {
                            //     console.log(file,filelist);
                            //     if (file.type !== 'application/x-zip-compressed') {
                            //       message.error(`${file.name}不是zip类型，请上传zip类型文件`);
                            //     }
                            //     else {
                            //         if (this.props.userStore.currUser.usr !== file.name.substr(0,13)) {
                            //             message.error(`${file.name}命名有错误，请命名为自己的学号`);
                            //         }
                            //     }
                            //     return file.type === 'application/x-zip-compressed' && this.props.userStore.currUser.usr === file.name ? true : Upload.LIST_IGNORE;
                            //   }
                            // }
                            fileList={fileList}
                            onChange={(file)=>{
                                let fileList = [...file.fileList];
                                // 2. Read from response and show file link
                                fileList = fileList.map(file => {
                                    if (file.response) {
                                      // Component will show file.url as link
                                      file.url = 'http://116.62.220.126' + file.response.url;
                                    }
                                    return file;
                                  });
                                setFileList(fileList)
                                // console.log(fileList);
                                setShowlist(true)
                            }}
                            showUploadList={false}
                        ><li><button><img src={upload} alt='' />上传</button></li>
                    </Upload>
                    <Popover content={content} title="已上传文件列表" onClick={()=>setShowlist(!showlist)} visible={showlist} >
                        <li><button><img src={file} alt='' />文件列表{showlist ? '▴' : '▾'}</button></li>
                    </Popover>
                    <li onClick={() => saveMark()} ><button><img src={save} alt='' />保存</button></li>
                    <li onClick={submitMark} ><button><img src={submit} alt='' />提交</button></li>
                </ul>
            </div>
            <div className="m-marked">
                <textarea
                    ref={edit}
                    style={{resize:'none',border:0}}
                    className="input-region markdownStyle"
                    id="mark"
                    autoFocus
                    onScroll={(e) => handleScroll(1, e)}
                    onChange ={e => {
                        updatePoint(e)
                    }}
                    onClick ={e => {
                        updatePoint(e)
                    }}
                    onKeyDown = {(e,d) => {
                        updatePoint(e)
                        if (e.code === 'Tab') {
                            addMark('  ',2)
                            e.preventDefault();
                        }
                    }}
                ></textarea>
                <div
                    ref={show}
                    onScroll={(e) => handleScroll(2, e)}
                    className="show-region markdownStyle"
                    id="show"
                    // onChange={(e)=>{console.log(e);}}
                    dangerouslySetInnerHTML={{
                        __html: showText,
                    }}
                ></div>
            </div>
        </div>
        </div>
    );
};

export default Marked;
