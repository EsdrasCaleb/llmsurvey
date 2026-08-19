import React from "react";
import { Select, Flex, Typography, Space } from "antd";
import { useTranslation } from "react-i18next";

const { Option } = Select;

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const handleLanguageChange = (value) => {
        i18n.changeLanguage(value);
    };

    // Pega o idioma atual sem depender do navegador
    const currentLang = (i18n.language || "pt").split("-")[0];

    return (
        <Flex justify="flex-end" align="center" style={{ padding: "10px 24px", backgroundColor: "#ffffff", borderBottom: "1px solid #f0f0f0" }}>
            <Space>
                <Typography.Text type="secondary">Idioma / Language:</Typography.Text>
                <Select
                    value={['pt', 'en', 'es'].includes(currentLang) ? currentLang : 'pt'}
                    style={{ width: 130 }}
                    onChange={handleLanguageChange}
                >
                    <Option value="pt">Português</Option>
                    <Option value="en">English</Option>
                    <Option value="es">Español</Option>
                </Select>
            </Space>
        </Flex>
    );
};

export default LanguageSwitcher;