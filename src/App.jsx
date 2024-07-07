import { useState, useEffect } from 'react'; 

export default function App() {
  const [search, setSearch] = useState(true);
  const [repoName, setRepoName] = useState(null);
  const [data, setData] = useState({});
  const [tree, setTree] = useState([]);
  const [blob, setBlob] = useState(null);

  async function fetchJson(url) {
    const resp = await fetch(url);
    return await resp.json();
  }

    async function fetchData() {
      if (!repoName)
        return;

    const response = await fetch(`https://api.github.com/repos/${repoName}`);
    const jsonData = await response.json();

    // const jsonData = {
    //   forks_count: 2346,
    //   full_name: "ziglang/zig",
    //   stargazers_count: 32122,
    //   trees_url: "https://api.github.com/repos/ziglang/zig/git/trees{/sha}",
    // };

    console.log(jsonData);
    setData(jsonData);

    const tree_url = jsonData.trees_url.slice(0, -6) + "/" + jsonData.default_branch;
    const tree_json = await fetchJson(tree_url);

    setTree([...tree, tree_json.tree]);
    setBlob(null);
  }

  async function openTree(ev) {
    const name = ev.target.textContent.slice(0, -1);
    const url = tree[tree.length-1].find(n => n.path === name).url;
    
    const json_data = await fetchJson(url);
    setTree([...tree, json_data.tree]);
  }

  async function openBlob(ev) {
    const name = ev.target.textContent;
    const url = tree[tree.length-1].find(n => n.path === name).url;

    const json_data = await fetchJson(url);
    setBlob(atob(json_data.content));
  }

  function goHome() {
    setBlob(null);
    setTree(tree.slice(0, 2));
  }

  function goBack() {
    if (blob) setBlob(null);
    else if (tree.length > 1) setTree(tree.slice(0, tree.length-1));
  }
  
  useEffect(() => { fetchData(); }, [repoName])

  function onsubmit(e) {
    e.preventDefault();

    setRepoName(e.target.elements.name.value);
    setSearch(false);
    setTree([]);
    setBlob(null);
  }

  return <>
    {search && 
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-5xl mb-3">Open Git</h1>
        <form className="flex items-center" onSubmit={onsubmit}>
          <input id="name" name="name" className="border border-grey-200 p-2 mr-2" placeholder="author/repo" />
          <button type="submit">          
              <svg class="h-8 w-8 text-blue-500" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <circle cx="10" cy="10" r="7" />  <line x1="21" y1="21" x2="15" y2="15" /></svg>  
          </button>
        </form>
        <p>Try "microsoft/vscode"</p>
      </div>
    }
    {!search && data &&
      <div className="flex-auto mx-48">
        <div className="flex justify-between">
          <button onClick={() => goHome()} className="text-3xl font-bold">{repoName}</button>
          <button onClick={() => setSearch(true) && setRepoName(null)}>
            <svg class="h-8 w-8 text-blue-500" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <circle cx="10" cy="10" r="7" />  <line x1="21" y1="21" x2="15" y2="15" /></svg>  
          </button>
        </div>
        <div className="flex">
          <svg class="h-8 w-8 text-blue-500"  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <circle cx="12" cy="18" r="2" />  <circle cx="7" cy="6" r="2" />  <circle cx="17" cy="6" r="2" />  <path d="M7 8v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2 -2v-2" />  <line x1="12" y1="12" x2="12" y2="16" /></svg>
          <p className="text-2xl pr-3">{data.forks_count}</p>
          <svg class="h-8 w-8 text-amber-500"  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <path d="M12 17.75l-6.172 3.245 1.179-6.873-4.993-4.867 6.9-1.002L12 2l3.086 6.253 6.9 1.002-4.993 4.867 1.179 6.873z" /></svg>
          <p className="text-2xl">{data.stargazers_count}</p>
        </div>
        <div className="mt-3 mb-8 max-h-screen border-2 rounded-md overflow-auto">
          <div className="border-b-2"><button className="pl-2" onClick={goBack}>Back</button></div>
          {blob && <code className="whitespace-pre overflow-auto">{blob}</code>}
          {!blob && tree && tree[tree.length-1] && tree[tree.length-1].map(node => node.type === "tree" && <Folder path={node.path} func={openTree} />)}
          {!blob && tree && tree[tree.length-1] && tree[tree.length-1].map(node => node.type !== "tree" && <Blob path={node.path} func={openBlob} />)}
        </div>
      </div>
    }
  </>
  
  
}

function Folder({path, func}) {
  return <div className="flex border-b-2">
    <svg class="h-8 w-8 text-gray-500"  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" /></svg>
    <button className="pl-2" onClick={func}>{path}/</button>
  </div>
}

function Blob({path, func}) {
  return <div className="flex border-b-2">
    <svg class="h-8 w-8 text-gray-500"  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <path d="M14 3v4a1 1 0 0 0 1 1h4" />  <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /></svg>
    <button className="pl-2" onClick={func}>{path}</button>
  </div>
}
