<?php

namespace modules\forms\models;

use Craft;
use craft\base\Model;

class Form extends Model
{
    public function getAttributeInputType(string $name): string
    {
        if (!method_exists($this, 'attributeTypes')) {
            return 'text';
        }

        $typeMap = $this->attributeTypes();

        if (!isset($typeMap[$name])) {
            return 'text';
        }

        return $typeMap[$name];
    }

    public function getAttributeInputSize(string $name): string
    {
        if (!method_exists($this, 'attributeSizes')) {
            return 'full';
        }

        $sizeMap = $this->attributeSizes();

        if (!isset($sizeMap[$name])) {
            return 'full';
        }

        return $sizeMap[$name];
    }

    public function getAttributeInputIcon(string $name): string
    {
        if (!method_exists($this, 'attributeIcons')) {
            return '';
        }

        $iconsMap = $this->attributeIcons();

        if (!isset($iconsMap[$name])) {
            return '';
        }

        return $iconsMap[$name];
    }

    public function getAttributeInputOptions(string $name): array
    {
        if (!method_exists($this, 'attributeOptions')) {
            return [];
        }

        $optionsMap = $this->attributeOptions();

        if (!isset($optionsMap[$name])) {
            return [];
        }

        return $optionsMap[$name];
    }

    public function getAttributeInputAttributes(string $name): array
    {
        if (!method_exists($this, 'attributeAttributes')) {
            return [];
        }

        $attributesMap = $this->attributeAttributes();

        if (!isset($attributesMap[$name])) {
            return [];
        }

        return $attributesMap[$name];
    }

    public function printAttributesSummaryTable(string $heading = ''): string
    {
        $table = sprintf('<h1>%s</h1>', $heading);
        $table .= '<hr />';
        $table .= '<h3>Details</h3>';
        $table .= '<table border="0" cellpadding="10">';
        $table .= '<tbody>';
        foreach ($this->getAttributes() as $name => $value) {
            $table .= '<tr><td>';
            $table .= sprintf('<strong>%s</strong>', $this->getAttributeLabel($name));
            $table .= '</td>';
            $table .= '<td>';
            $table .= is_array($value) ? implode(', ', $value) : $value;
            $table .= '</td></tr>';
        }
        $table .= '</tbody>';
        $table .= '</table>';

        return $table;
    }
}
