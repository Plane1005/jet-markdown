封装的React前端markdown组件

### 两边滑轮同步问题
我们需要注意的是，编辑区和渲染区的高度是不一样的，但是可视区范围是一样的
以滑动编辑区为例，计算出当前滑轮的top位置与top位置的最大值的比例，即 scale = scrollTop / (scrollHeight - clientHeight)
然后去驱动渲染区的滑轮位置
el.scrollTop = (scrollHeight - clientHeight) * scale

### 滑轮同步时死循环，无限触发的解决方案（左边滑轮触发同步后，右边开始同步，又触发了左边的同步）
用一个变量记住你当前手动触发的是哪个区域的滚动，这样就可以在 handleScroll 方法里区分此次滚动是被动触发的还是主动触发的了
设置定时器，当区域滑动结束一段时间后，初始化变量，我设置的是200ms

### textarea foucs之后只能定位在文章最后的问题
mark.setSelectionRange(begin+type,begin+type);
mark.focus()
互换位置

### antd上传文件区域，不想连接在一起
使用两个upload组件，维护一个fileList

### 给markdwon增加当鼠标选中文字时，也可以加粗
维护一个类型数组，实现按键类型的不同，控制不同的字符串拼接与光标缩进

### 设置所有的a标签都为新便签页打开
首先想到获取所有a标签的dom节点，依次设置target属性，后来发现会有bug，会出现刚设置好时无法立即设置好的情况
后来看到了一个简便方法，直接在index.html中加入
// <base target="_blank" />
直接全局设置

