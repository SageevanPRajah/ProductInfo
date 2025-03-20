import React from 'react';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: #001f3f; /* Dark blue background */
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const SidebarHeader = styled.div`
  margin-bottom: 30px;
  font-size: 20px;
  font-weight: bold;
`;

const SidebarMenu = styled.ul`
  list-style: none;
  padding: 0;
`;

const SidebarMenuItem = styled.li`
  padding: 10px 15px;
  cursor: pointer;
  margin-bottom: 5px;
  border-radius: 5px;
  text-align: left;
  background-color: #28a745; /* Green background */
  color: white;

  &:hover {
    background-color: #218838; /* Darker green on hover */
  }
`;

const SidebarFooter = styled.div`
  padding-top: 20px;
  border-top: 1px solid #4a5568;
  text-align: left;
`;

const AdminInfo = styled.div`
  display: flex;
  align-items: center;
`;

const AdminIcon = styled.span`
  margin-right: 5px;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 20px;
  background-color: #fff;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  color: #4a5568;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 5px;
  width: 200px;
  margin-right: 10px;
  background-color: #e9ecef;
`;

const ShortBySelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 5px;
  margin-right: 10px;
  background-color: #e9ecef;
  color: #495057;
`;

const Button = styled.button`
  background-color: #007bff; /* Blue button */
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3; /* Darker blue on hover */
  }
`;

const ContentArea = styled.div`
  padding: 20px;
  border-radius: 5px;
`;

const Dashboard = () => {
  return (
    <DashboardContainer>
      <Sidebar>
        <SidebarHeader>PRODUCTINFOHUB</SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
             
            Home
          </SidebarMenuItem>
          <SidebarMenuItem>
             
            Products
          </SidebarMenuItem>
          <SidebarMenuItem>
             
            About
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarFooter>
          <AdminInfo>
            <AdminIcon>👤</AdminIcon>
            <div>
              <div>Admin</div>
              <div>Example@gmail.com</div>
            </div>
          </AdminInfo>
        </SidebarFooter>
      </Sidebar>
      <MainContent>
        <Header>
          <Title>All Templates</Title>
          <div>
            <SearchInput type="text" placeholder="Search........" />
            <ShortBySelect>
              <option>Short by</option>
              <option>Name</option>
              <option>Date</option>
            </ShortBySelect>
            <Button>Add new Template</Button>
          </div>
        </Header>
        <ContentArea>{/* Content will go here */}</ContentArea>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
