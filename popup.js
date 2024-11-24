
function fetchTabs() {
    chrome.tabs.query({}, (tabs) => {
      const tabList = document.getElementById("tab-list");
      const tabCount = document.getElementById("tab-count");
  
      tabList.innerHTML = "";
      tabCount.textContent = `Total Tabs: ${tabs.length}`;
  
      const groupedTabs = tabs.reduce((groups, tab) => {
        const domain = new URL(tab.url).hostname;
        if (!groups[domain]) groups[domain] = [];
        groups[domain].push(tab);
        return groups;
      }, {});
  
      for (const [domain, domainTabs] of Object.entries(groupedTabs)) {
        const groupDiv = document.createElement("div");
        groupDiv.className = "group";
  
        const groupHeader = document.createElement("h4");
        groupHeader.textContent = domain;
        groupDiv.appendChild(groupHeader);
  
        domainTabs.forEach((tab) => {
          const tabItem = document.createElement("div");
          tabItem.className = "tab";
  
          const tabInfo = document.createElement("h3");
          tabInfo.textContent = tab.title;
          tabInfo.onclick = () => focusTab(tab.id); 
  
          const closeButton = document.createElement("button");
          closeButton.textContent = "Close";
          closeButton.onclick = () => closeTab(tab.id);
  
          tabItem.appendChild(tabInfo);
          tabItem.appendChild(closeButton);
          groupDiv.appendChild(tabItem);
        });
  
        tabList.appendChild(groupDiv);
      }
    });
  }
  
  function closeTab(tabId) {
    chrome.tabs.remove(tabId, () => {
      fetchTabs();
    });
  }
  
  function focusTab(tabId) {
    chrome.tabs.update(tabId, { active: true });
  }
  
  function mergeTabsIntoGroups() {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const groupedTabs = tabs.reduce((groups, tab) => {
        try {
          const domain = new URL(tab.url).hostname
            .replace("www.", "") 
            .split(".")[0]; 
          if (!groups[domain]) groups[domain] = [];
          groups[domain].push(tab);
        } catch (e) {
          console.warn("Skipping invalid tab URL:", tab.url);
        }
        return groups;
      }, {});
  
      for (const [domain, domainTabs] of Object.entries(groupedTabs)) {
        const tabIds = domainTabs.map((tab) => tab.id);
  
        chrome.tabs.group({ tabIds }, (groupId) => {
          if (chrome.runtime.lastError) {
            console.error("Error creating group:", chrome.runtime.lastError.message);
            return;
          }
          if (groupId !== undefined) {
            chrome.tabGroups.update(groupId, {
              title: domain,
              color: "blue",
            });
          }
        });
      }
    });
  }
  

  document.getElementById("search").addEventListener("input", (event) => {
    const query = event.target.value.toLowerCase();
  
    chrome.tabs.query({}, (tabs) => {
      const tabList = document.getElementById("tab-list");
      tabList.innerHTML = ""; 
  
      const filteredTabs = tabs.filter(
        (tab) => tab.title.toLowerCase().includes(query) || tab.url.toLowerCase().includes(query)
      );
  
      const groupedTabs = filteredTabs.reduce((groups, tab) => {
        const domain = new URL(tab.url).hostname;
        if (!groups[domain]) groups[domain] = [];
        groups[domain].push(tab);
        return groups;
      }, {});
  
      for (const [domain, domainTabs] of Object.entries(groupedTabs)) {
        const groupDiv = document.createElement("div");
        groupDiv.className = "group";
  
        const groupHeader = document.createElement("h4");
        groupHeader.textContent = domain;
        groupDiv.appendChild(groupHeader);
  
        domainTabs.forEach((tab) => {
          const tabItem = document.createElement("div");
          tabItem.className = "tab";
  
          const tabInfo = document.createElement("h3");
          tabInfo.textContent = tab.title;
          tabInfo.onclick = () => focusTab(tab.id);
  
          const closeButton = document.createElement("button");
          closeButton.textContent = "Close";
          closeButton.onclick = () => closeTab(tab.id);
  
          tabItem.appendChild(tabInfo);
          tabItem.appendChild(closeButton);
          groupDiv.appendChild(tabItem);
        });
  
        tabList.appendChild(groupDiv);
      }
    });
  });
  
  document.getElementById("merge-btn").addEventListener("click", mergeTabsIntoGroups);
  
  fetchTabs();
  
