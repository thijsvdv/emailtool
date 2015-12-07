<?php

// print_r($_FILES);

// This is a simplified example, which doesn't cover security of uploaded images.
// This example just demonstrate the logic behind the process.

// files storage folder
$dir = 'img/upload/';
$upload = array_shift($_FILES);


// print replace($_SERVER['DOCUMENT_ROOT'], '', dirname($_SERVER['SCRIPT_FILENAME']));
// print $_SERVER['HTTP_REFERER'];
// print $_SERVER['HTTP_HOST'];
// print_r($upload);

if ($upload['type'][0] == 'image/png'
|| $upload['type'][0] == 'image/jpg'
|| $upload['type'][0] == 'image/gif'
|| $upload['type'][0] == 'image/jpeg'
|| $upload['type'][0] == 'image/pjpeg')
{
    // setting file's mysterious name
    $filename = md5(date('YmdHis')).'.jpg';
    $file = $dir.$filename;

    // /var/www/clients/client1/web1/web/app/mqm/

    // print $file . "<br>";

    // copying
    if(move_uploaded_file($upload['tmp_name'][0], $file)) {
        // displaying file
        $array = array(
            'filelink' => 'http://' . $_SERVER['HTTP_HOST'] . '/app/mqm/img/upload/' . $filename
        );

        echo stripslashes(json_encode($array));

    }


}

?>