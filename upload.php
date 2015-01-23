<?php

// print_r($_FILES);

// This is a simplified example, which doesn't cover security of uploaded images.
// This example just demonstrate the logic behind the process.

// files storage folder
$dir = 'img/upload/';

// $_FILES['file']['type'] = strtolower($_FILES['file']['type']);
$upload = array_shift($_FILES);

// print("<br>");
// print("<br>");

// print_r($file);

// print("<br>");
// print("<br>");

// $file['type'] = strtolower($_FILES['file']['type']);

// print $file['type'];

// if ($_FILES['file']['type'] == 'image/png'
// || $_FILES['file']['type'] == 'image/jpg'
// || $_FILES['file']['type'] == 'image/gif'
// || $_FILES['file']['type'] == 'image/jpeg'
// || $_FILES['file']['type'] == 'image/pjpeg')
if ($upload['type'] == 'image/png'
|| $upload['type'] == 'image/jpg'
|| $upload['type'] == 'image/gif'
|| $upload['type'] == 'image/jpeg'
|| $upload['type'] == 'image/pjpeg')
{
    // print "Correct file type<br>";
    // setting file's mysterious name
    $filename = md5(date('YmdHis')).'.jpg';
    $file = $dir.$filename;

    // print $file . "<br>";

    // copying
    move_uploaded_file($upload['tmp_name'], $file);

    // displaying file
    $array = array(
        'filelink' => 'img/upload/'.$filename
    );

    echo stripslashes(json_encode($array));

}

?>