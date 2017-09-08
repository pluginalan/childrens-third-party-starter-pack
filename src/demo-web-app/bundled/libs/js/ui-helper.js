define(function(){
  function appendSubtitle(titleStr) {
      var title = document.createElement("h2");
      title.innerHTML = titleStr;
      inner.appendChild(title);
  }

  function addStylesheet(gameDir) {
      var link  = document.createElement('link');
      link.rel  = 'stylesheet';
      link.type = 'text/css';
      link.href = gameDir + 'style.css';
      link.media = 'all';
      document.getElementsByTagName('head')[0].appendChild(link);
  }

  function appendHorizontalRule() {
      var hr = document.createElement("hr");
      inner.appendChild(hr);
  }

  function appendSpacer() {
      var div = document.createElement("div");
      inner.appendChild(div);
  }

  function appendTitle(gameDir, titleStr, parent, noLogo) {
      if (!parent) {
          parent = wrapper;
      }
      var bbcLogo = document.createElement("img");
      var title = document.createElement("h1");
      if (!noLogo) {
          bbcLogo.src = gameDir + "bbc-blocks-dark.png";
          bbcLogo.className = "bbc-logo";
          bbcLogo.alt = "BBC Logo";
      }
      title.innerHTML = titleStr;
      var element = document.getElementById("wrapper");
      element.insertBefore(bbcLogo, document.getElementById("inner"));
      element.insertBefore(title, document.getElementById("inner"));
  }

  function appendParagraph(text, parent) {
      if (!parent) {
          parent = inner;
      }
      var paragraph = document.createElement("p");
      paragraph.innerHTML = text || '';
      parent.appendChild(paragraph);
      return paragraph;
  }

  function appendSpan(text, div) {
      var span = document.createElement("span");
      span.innerHTML = text;
      if (div) {
          div.appendChild(span);
      }
      else {
          inner.appendChild(span);
      }
  }

  function appendLink(linkText, link, div) {
      var a = document.createElement('a');
      a.innerHTML = linkText;
      a.href = link;
      if (div) {
          div.appendChild(a);
      }
      else {
          inner.appendChild(a);
      }
  }

  function appendBtn(label, onClick, parent) {
      if (!parent) {
          parent = inner;
      }
      var btn = document.createElement("button");
      btn.innerHTML = label;
      btn.onclick = onClick;
      parent.appendChild(btn);

      return btn;
  }

  function appendDiv(parent) {
      if (!parent) {
          parent = inner;
      }
      var div = document.createElement("div");
      parent.appendChild(div);
      return div;
  }

  function appendToInnerDiv() {
        var div = document.createElement("div");
        inner.appendChild(div);
        return div;
    }

  function appendImage(url, parent) {
      if (!parent) {
          parent = inner;
      }
      var img = document.createElement("img");
      img.setAttribute("src", url);
      parent.appendChild(img);
      return img;
  }

  function appendBreak(parent) {
      if (!parent) {
          parent = inner;
      }
      var br = document.createElement("br");
      parent.appendChild(br);
  }

  function inputOnlick(event) {
      var inputEle = event.target;
      if (inputEle.value === 'Enter a message here') {
          inputEle.value = '';
          inputEle.className = 'strong-text';
      }
  }

  function inputOnBlur(event) {
      var inputEle = event.target;
      if (inputEle.value === '') {
          inputEle.value = 'Enter a message here';
          inputEle.className = '';
      }
  }

  function appendTextInput( elementID, defaultValue = undefined ) {
      var input = document.createElement("input");
      input.type = "text";
      input.id = elementID;
      input.value = defaultValue ? defaultValue : 'Enter a message here';
      input.onclick = uihelper.inputOnlick;
      input.onblur = inputOnBlur;
      inner.appendChild(input);
  }

  function createAudioLabel(audioEnabled) {
      var audioLabel = document.createElement("span");
      audioLabel.innerHTML = audioEnabled;
      audioLabel.id = "audio-label";
      return audioLabel;
  }

  function createLabel(text, id) {
      var label = document.createElement("span");
      label.innerHTML = text;
      label.id = id;
      label.className = "setting";
      return label;
  }

  return {
      appendSubtitle: appendSubtitle,
        addStylesheet: addStylesheet,
        appendHorizontalRule: appendHorizontalRule,
        appendSpacer: appendSpacer,
        appendTitle: appendTitle,
        appendParagraph: appendParagraph,
        appendSpan: appendSpan,
        appendLink: appendLink,
        appendBtn: appendBtn,
        appendDiv: appendDiv,
        appendImage: appendImage,
        appendBreak: appendBreak,
        inputOnlick: inputOnlick,
        inputOnBlur: inputOnBlur,
        appendTextInput: appendTextInput,
        createAudioLabel: createAudioLabel,
        createLabel: createLabel,
        appendToInnerDiv: appendToInnerDiv
  };

});
