<?php

const CONFIG_ROUTE = "config/configcopy.xml";

function parseXMLConfig(string $xml_config_route)
{
    if (file_exists($xml_config_route)) {

    }
}

$parse = function(int $staged_p, string $fc) {
    [$OPEN, $CLOSE, $LAST, $SEP] = ['<', '>', '/', ' '];
    $inside_tag = false;
    $dom = [];

    $attributes = [];
    $childs = [];
    $tag = null;
    $inside_last_tag = false;

    for ($running_p = $staged_p; $running_p < strlen($fc); $running_p += 1) {
        $current_ch = $fc[$running_p];

        if ($current_ch == $OPEN && $inside_tag == false) {
            $staged_p = $running_p;
            $inside_tag = true;
            continue;
        }

        if ($inside_tag == true) {
            if ($current_ch == $CLOSE && $tag == null) {
                $tag = substr($fc, $staged_p + 1, $running_p - ($staged_p + 1));
                $staged_p = $running_p;
                $inside_tag = false;
            }
            if ($current_ch == $SEP) {
                if ($tag == null) {
                    $tag = substr($fc, $staged_p + 1, $running_p - ($staged_p + 1));
                    $staged_p = $running_p;
                } else {
                    $attributes[] = substr($fc, $staged_p + 1, $running_p - ($staged_p + 1));
                    $staged_p = $running_p;
                }
            }
            if ($current_ch == $LAST) {
                $inside_last_tag = true;
                continue;
            }
        }

        if ($inside_last_tag == true) {
            if ($tag != null) {
                $dom[] = [
                    'attributes' => $attributes,
                    'childs' => $childs,
                    'tag' => $tag
                ];
            }
            $inside_last_tag = false;
        }
    }
    return $dom;
};

$fc = file_get_contents(CONFIG_ROUTE);
$XMLdomStruct = $parse(0, $fc);
var_dump($XMLdomStruct);
