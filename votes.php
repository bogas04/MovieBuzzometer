<?php
     if(!(isset($_POST['r']) && isset($_POST['d']))) {
          echo json_encode(array("error"=>"illegal"));
          // die();
     }
     $movie = simplexml_load_file('data.xml');
     $m = $movie->movie;
     switch($_POST['r']) {
          case 's' : foreach($m as $m1) {
                              if($m1->id == $_POST['d']['id']) {
                                   switch($_POST['d']['oid']) {
                                        case 1: $m1->option1->votes++; break;
                                        case 2: $m1->option2->votes++; break;
                                        case 3: $m1->option3->votes++; break;
                                        case 4: $m1->option4->votes++; break;
                                   }
                                   echo json_encode(array("m"=>$m1));
                              }
                         }
                         $dom = new DOMDocument('1.0');
                         $dom->preserveWhiteSpace = false;
                         $dom->formatOutput = true;
                         $dom->loadXML($movie->asXML());
                         $dom->save("data.xml");
                         break;
          case 'g' :  foreach($m as $m1) {
                              if($m1->id == $_POST['d']['id']) {
                                   echo json_encode(array("m"=>$m1,"error"=>"none"));
                                   die();
                              }
                         }
                         echo json_encode(array("a"=>$m,"error"=>"na"));
                         break;
          default :   echo json_encode(array("error"=>"unknown"));
                         break;
     }
?>