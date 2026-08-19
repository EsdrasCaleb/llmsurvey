import React from 'react';
import { Layout, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import CompleteTestQualityForm from './CompleteTestQualityForm';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
    const { t } = useTranslation();

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            {/* INCLUÍDO NO TOPO DA PÁGINA */}
            <LanguageSwitcher />

            <Header style={{ backgroundColor: 'white', textAlign: 'center' }}>
                <Title level={2} style={{ margin: '14px 0' }}>
                    {t('form.mainTitle')}
                </Title>
            </Header>

            <Content style={{ padding: '50px 20px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                <CompleteTestQualityForm />
            </Content>
        </Layout>
    );
}

export default App;