/**
 * When set to true, this variable makes it possible to debug css for the folder selector without having 
 * connection to a card.
 */
var debug_tree=true;

/**
 * Execute function settingsLoad at DOM Load
 * if browser does not support it is also executed from the bodies "onLoad" statement
 * @{
 */
document.addEventListener("load", cookieLoad, false);
document.addEventListener("DOMContentLoaded", cookieLoad, false);
/**
 * @}
 */

/**
 * keeps the current running timeout for the runner
 */
var timeout; 

/**
 * a variable for safe disable of the runner function in any state
 */
var run=false;

/**
 * The time and date of the latest picture known to the application are stored here
 * @{
 */
var last_time=0;
var last_date=0;
/**
 * @}
 */

/**
 * This variable specifies the current state of the settings menus visibility
 */
var settings_displayed=false;

/**
 * This function gets a cookie
 * @param variable
 * @returns
 */
function getCookie(variable)
{
	var n = variable + "=";
	var cookieArray = document.cookie.split(';');
	for(var i=0; i<cookieArray.length; i++)
	  {
	  var c = cookieArray[i].trim();
	  if (c.indexOf(n)==0) 
		  return c.substring(n.length,c.length);
	  }
	return "";
} 

/**
 * This function sets a cookie
 * @param variable The cookies name
 * @param value the value it should get now
 * @param expireAt How many days till when the cookie expires
 */
function setCookie(variable,value,expireAt)
{
var d = new Date();
d.setTime(d.getTime()+(expireAt*24*60*60*1000));
var expires = "expires="+d.toGMTString();
document.cookie = variable + "=" + value + "; " + expires;
} 


/**
 * Make an element be displayed in fullscreen
 * @param element The id of the element
 */
function Fullscreen(element) 
{
  if (element.requestFullScreen) 
  {
	
    if (!document.fullScreen) {
      element.requestFullscreen();
    } else {
      document.exitFullScreen();
    }

  } else if (element.webkitRequestFullScreen) {

	    if (!document.webkitIsFullScreen) 
	    {
	      element.webkitRequestFullScreen();
	    } else {
	      document.webkitCancelFullScreen();
	    }
	  
  } else if (element.mozRequestFullScreen) {
	  
    if (!document.mozFullScreen) {
      element.mozRequestFullScreen();
    } else {
      document.mozCancelFullScreen();
    }

  }
}

/**
 * This creates a fileObject, it's used to store information
 * about folder contents
 */
function fileObject(directory,filename,size,attribute,date,time)
{
	if(directory=='')
	{
		this.directory='/';
	}
	else
	{
		this.directory=directory;
	}
	
	this.filename=filename;
	this.isReadOnly=!!(attribute & (1<<0));
	this.isHidden=!!(attribute & (1<<1));
	this.isSystemFile=!!(attribute & (1<<2));
	this.isVolume=!!(attribute & (1<<3));
	this.isDirectory=!!(attribute & (1<<4));
	this.isArchive=!!(attribute & (1<<5));
	this.date=date;
	this.time=time;

    this.time_human=
    {
    	hour: (time&(0x1F<<11))>>11,
    	minute:(time&(0x3F<<5))>>5,
    	second:(time&(0x1F))*2
    };

    this.date_human=
    {
    		year:((date&(0x3F<<9))>>9)+1980,
    		month:((date&(0x1F<<5))>>5),
    		day:date&(0x1F),
    };
}

/**
 * Creates objects out of the string returned by the getFolder command of FlashAir card
 * @param directory_info the string returned by getFolder content
 * @returns {Array} of fileObject elements
 */
function splitDirectoryContent(directory_info)
{
	lines=directory_info.split('\n');
	dir_content = [];
	for (var l = 0; l < lines.length; l++) 
	{
		line=lines[l].split(',');
		if(line.length==6)
		{
			ob=new fileObject(line[0],line[1],line[2],line[3],line[4],line[5]);
			dir_content.push(ob);
		}
	}
	return dir_content;
}

/**
 * This function queries the directory content from the server
 * @param directory The directory string
 * @param callback function(directory, directory_content, callback_info) which is called when directory listing was received 
 * @param callback_info Additional information for the callback function
 */
function getDirectoryContent(directory, callback, callback_info)
{
	if(directory=='')
		directory='/';
		
    if (window.XMLHttpRequest)
    {
        oReq=new XMLHttpRequest();
    }
    else
    {
    	alert("Browser not supported, sorry!");
    	return;
    }
    oReq.open("GET","/command.cgi?op=100&DIR="+directory,true);
    
    oReq.onload = function (oEvent) {
  	var directory_content=splitDirectoryContent(oReq.response);
  	callback(directory, directory_content, callback_info);
  };
  oReq.send(null);   
}

/**
 * This function creates the folderlist for a directory
 * @param directory the directory string
 * @param directory_content {Array} of fileObjects
 * @param dir_descriptor The string of the id of the directories div container
 */
function createFolderListEntries(directory, directory_content, dir_descriptor)
{
	var element=document.getElementById('dir_id_'+ dir_descriptor);
	//var directory=element.getElementsByClassName('dir_radio')[0].value;

	
	button=element.getElementsByClassName('dir_button')[0];
	button.innerHTML='-';
	button.setAttribute('onclick',"collapseDirectory('" + dir_descriptor + "')");
	
	var directory_content_div = document.createElement("div");
	directory_content_div.setAttribute('class', 'dir_content');	
	element.appendChild(directory_content_div);
	
	var list = document.createElement("ol");
	directory_content_div.appendChild(list);
	
	
	for (var i = 0; i < directory_content.length; i++) 
	{
		var dir_obj = directory_content[i];
		if(dir_obj.isDirectory)
		{			
			var lentry=document.createElement("li");
			list.appendChild(lentry);
			
			
			var div_id=dir_descriptor + '_' + dir_obj.filename;
			var lentry_div=document.createElement("div");
			lentry_div.setAttribute('id','dir_id_' + div_id);
			lentry_div.setAttribute('class', 'dir_content_div');
			lentry.appendChild(lentry_div);
			
			


			var nbutton = document.createElement('button');
			nbutton.innerHTML='+';
			nbutton.setAttribute('class', 'dir_button');
			nbutton.setAttribute('onclick',"expandDirectory('" + div_id + "')");
			
			lentry_div.appendChild(nbutton);
			
			var lentry_head=document.createElement("span");
			lentry_head.setAttribute('class', 'dir_path');
			lentry_head.innerHTML=dir_obj.filename;
			lentry_div.appendChild(lentry_head);

			var nradio = document.createElement('input');
			nradio.setAttribute('class', 'dir_radio');
			nradio.setAttribute('type', 'radio');
			nradio.setAttribute('name', 'directory');
			nradio.setAttribute('value', directory + '/' + dir_obj.filename);
			nradio.setAttribute('onclick',  'directoryUpdate("'+ nradio.value + '")');
			if(document.getElementById('directory_storage').value == nradio.value)
				nradio.setAttribute('checked', 'checked');
			
			lentry_div.appendChild(nradio);
			
		}
	}
}

/**
 * Creates the directory list for a single directory in the settings.
 * @param dir_descriptor The id of the div container of the directory
 */
function expandDirectory(dir_descriptor)
{
	
	var element=document.getElementById('dir_id_'+ dir_descriptor);
	var directory=element.getElementsByClassName('dir_radio')[0].value;

	if(debug_tree)//create Test entries
	{
		directory_content=[];
		for (var i = 0; i < 5; i++) 
		{
			directory_content.push(new fileObject(directory,'c_' + i, 1000, (1<<4), 0815, 1234));
		}
		createFolderListEntries(directory, directory_content, dir_descriptor);	
	}
	else
	{
		getDirectoryContent(directory, createFolderListEntries, dir_descriptor);
	}
}

/**
 * This collapses a directory entry in the settings
 * @param dir_descriptor the div container of the directory entry
 */
function collapseDirectory(dir_descriptor)
{
	var element=document.getElementById('dir_id_'+ dir_descriptor);

	var button=element.getElementsByClassName('dir_button')[0];
	button.innerHTML='+';
	button.setAttribute('onclick',"expandDirectory('" + dir_descriptor + "')");
	
	var content=element.getElementsByClassName('dir_content')[0];
	element.removeChild(content);

}

/**
 * This function enables or disables the displaying an element with the display element
 * in CSS
 * @param elementID The ID of the element to be updated
 * @param show If true the element will be visible, if false it will be hidden.
 */
function displayElement(elementID, show)
{	
	if(show)
		show='initial';
	else
		show='none';
	
	document.getElementById(elementID).style.display = show;
}	

/**
 * Changes the display of the settings
 * also updates the cookie of the settings state
 */
function Settings()
{
	settings_displayed=!settings_displayed;

	displayElement('settings', settings_displayed);

	setCookie('settings',settings_displayed, 365);
}


/**
 * Function to be executed on page load to set everything as it was last time the
 * user used the application
 */
function cookieLoad()
{
	/*
	 * Get directory
	 */
	directory=getCookie('directory');
	if(directory=='')
		directory="/";
	
	if(directory=="/")
	{
		directory_field=document.getElementById('root_radio');
		directory_field.setAttribute('checked', 'checked');
	}
	
	directory_field=document.getElementById('directory_storage');
	directory_field.setAttribute('value', directory);
	
	
	
	/*
	 * Get settings status
	 */
	settings_cookie=getCookie('settings');
	if(settings_cookie=='' || settings_cookie == 'true')
		settings_cookie=true;
	else
		settings_cookie=false;

	settings_displayed=settings_cookie;
	displayElement('settings', settings_cookie);
}

/**
 * This function is called when the user selects another directory for
 * watching it, for automatically loading the latest image
 * @param directory The full directory path
 */
function directoryUpdate(directory)
{
	//Reset the latest time, to get the latest picture of the new directory
	last_date=0;
	last_time=0;
	
	setCookie('directory', directory, 365);
	directory_field=document.getElementById('directory_storage');
	directory_field.setAttribute('value', directory);
}


/**
 * This function updates the latest picture according to the folder content
 * of the selected folder
 * @param directory The current selected directory
 * @param directory_content {array} of FileObjects representing the current folders content
 * @param callback_info the Callback information for it being used as callback function (not used)
 */
function PictureUpdate(directory, directory_content, callback_info)
{
	load_file='';
	for (var i = 0; i < directory_content.length; i++) 
	{
		var dir_obj = directory_content[i];
		
		//Is it just a normal file?
//		if(  !dir_obj.isHidden
//		   &&!dir_obj.isSystemFile
//		   &&!dir_obj.isVolume
//		   &&!dir_obj.isDirectory
//		   &&!dir_obj.isArchive)
//		
		if(1)
		{
			filename_parts=dir_obj.filename.split('.');
			
			
			
			if(filename_parts.length!=0)
			{
				ending=filename_parts[filename_parts.length-1];
				ending=ending.toLowerCase();
				if(ending == 'jpg')
				{
					if(last_date<=dir_obj.date || last_time<dir_obj.time)
					{
						last_date=dir_obj.date;
						last_time=dir_obj.time;
						
						load_file=dir_obj.directory + "/" + dir_obj.filename;
					}
				}	
			}
		}
	}
	if(load_file!='')
	{
		document.getElementById('divImg').style.backgroundImage = "url(" + load_file + ")"; 
	}
}

/**
 * Function which constantly calls itself to grab the latest picture.
 */
function Runner()
{
	directory=document.getElementById('directory_storage').value;
	getDirectoryContent(directory, PictureUpdate, 0);

	if(run)
	{	
		timeout=setTimeout(Runner, 3000);
	}	
}

/**
 * Function called by the run/stop button when not running
 */
function Run()
{
	RunButton=document.getElementById('run_button');
	RunButton.setAttribute('onclick', 'Stop()');
	RunButton.innerHTML='Stop';
	run=true;
	Runner();
}

/**
 * Function called by the run/stop button when running
 */
function Stop()
{
	RunButton=document.getElementById('run_button');
	RunButton.setAttribute('onclick', 'Run()');
	RunButton.innerHTML='Run';
	run=false;
	clearTimeout(timeout);
}

