<?php
$files = scandir('saves');
$num_files = count($files);

$results = array();

foreach($files as $file) {
  if(strpos($file, ".html") !== false) {
    $results[$file] = file_get_contents("saves/" . $file);
  }
}

print(json_encode($results));
?>