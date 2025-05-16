function setCookie (name, value, days)
{
  if (days != 'SESSION') {
    var date = new Date();
    days = days || 365;
    date.setTime(date.getTime() + days*24*60*60*1000);
    var expires = date.toGMTString();
  } else {
    var expires = '';
  }
  document.cookie =
    name +'='+ escape(value)
    +   ((expires) ? '; expires='+ expires : '')
    +   '; path=/';
};

function SetLang(lang)
{
  setCookie('lang',lang.value,90);
  window.location.href = 'http://thesaga.mcwees.ru/';
  //location.reload(true);
};


