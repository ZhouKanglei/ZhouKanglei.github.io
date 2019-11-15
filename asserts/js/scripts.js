// $(function() { 
//     $("#zkl_paper_title").bind("click", function() {
//         alert();
//         var $item_content = $(this).next("#ul");
//         if ($item_content.is(":visible")) {
//             $item_content.hide();
//         } else {
//             $item_content.show();
//         }
//     })
// })

// $(document).ready(function(){
//     $('.zkl_obj_title').click(function(){
//         alert('aaaa')；
//     });

// });
// 
// 


function show_item(ele) {
	var ul = ele.nextElementSibling;
	if (ul.tagName == "UL" && ul.getAttribute('class') == "zkl_obj_item") {
		if (ul.style.display == "none" || ul.style.display == "") {
			ul.style.display = "block";
		} else {
			ul.style.display = "none";
		}
	}
	// var uls = document.getElementsByClassName("zkl_obj_item");
	// if (uls[arg].style.display == 'none' || uls[arg].style.display == '') {
	// 	uls[arg].style.display = 'block';
	// 	// alert(uls[arg].style.display);
	// } else {
	// 	uls[arg].style.display = 'none';
	// 	// alert(uls[arg].style.display);
	// }
	
}

window.onload = function() { 
    var uls = document.getElementsByClassName("zkl_obj_item");
    for (var i = uls.length - 1; i >= 0; i--) {
    	uls[i].style.display = 'none';
    
    }
} 
	
