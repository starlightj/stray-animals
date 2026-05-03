import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  CameraOutlined,
  UnorderedListOutlined,
  EnvironmentOutlined,
  DashboardOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: '数据看板' },
    { key: '/recognize', icon: <CameraOutlined />, label: '识别上报' },
    { key: '/archive', icon: <UnorderedListOutlined />, label: '动物档案' },
    { key: '/map', icon: <EnvironmentOutlined />, label: '地图追踪' },
    { key: '/admin', icon: <SettingOutlined />, label: '管理后台' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            padding: 16,
            fontWeight: 'bold',
            fontSize: 16,
          }}
        >
          🐾 校园动物管理
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname === '/' ? '/' : location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', paddingLeft: 24, fontSize: 18, fontWeight: 500 }}>
          基于图像识别的流浪动物管理系统
        </Header>
        <Content style={{ margin: 16 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;