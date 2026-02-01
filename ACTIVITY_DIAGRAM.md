```mermaid
graph TD
    %% Define Styles
    classDef terminus fill:#f9f,stroke:#333,stroke-width:2px;
    classDef process fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef decision fill:#fff9c4,stroke:#fbc02d,stroke-width:2px,stroke-dasharray: 5 5;
    classDef system action fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;

    subgraph User_Actions [User]
        Start([Start]) --> Login_User[Login]
        Login_User --> Is_Registered{Registered?}
        Is_Registered -- No --> Register[Register]
        Register --> OTP_Verify[Verify Contact / OTP]
        OTP_Verify --> Login_User
        Is_Registered -- Yes --> Enter_Creds[Enter Credentials]
        Enter_Creds --> User_Dashboard[User Dashboard]
        
        %% User Operations
        User_Dashboard --> Browse_Books[Browse / Search Books]
        Browse_Books --> Select_Book[Select Book]
        Select_Book --> Action_Choice{Action?}
        Action_Choice -- Issue --> Req_Issue[Request Issue Book]
        Action_Choice -- Read --> Read_Content[Read E-Book Content]
        
        User_Dashboard --> View_Issued[View Issued Books]
        View_Issued --> Return_Book_Action[Return Book]
        
        User_Dashboard --> Add_Coins_Action[Add Coins]
    end

    subgraph System_Logic [System]
        %% Auth Logic
        Enter_Creds --> Auth_Check{Valid Credentials?}
        Auth_Check -- No --> Error_Login[Show Error]
        Error_Login --> Login_User
        Auth_Check -- Yes --> Role_Check{Role?}
        
        %% Issue Book Logic
        Req_Issue --> Check_Coins{Coins >= 100?}
        Check_Coins -- No --> Err_Coins[Error: Insufficient Coins]
        Check_Coins -- Yes --> Check_Avail{Book Available?}
        Check_Avail -- No --> Err_Avail[Error: Not Available]
        Check_Avail -- Yes --> Lock_Book[Lock Physical Book]
        Lock_Book --> Deduct_Coin_Issue[Deduct 100 Coins]
        Deduct_Coin_Issue --> Create_Issue_Record[Create Issue Record]
        Create_Issue_Record --> Update_User_Client[Update User State]

        %% Return Logic
        Return_Book_Action --> Update_Issue_Status[Mark as Returned]
        Update_Issue_Status --> Release_Book[Release Book Availability]
        Release_Book --> Update_User_Client

        %% Background Jobs / Triggers
        Sync_Fines[Sync Fines Process] --> Check_Overdue{Is Overdue?}
        Check_Overdue -- Yes --> Calc_Fine[Calculate Fine]
        Calc_Fine --> Deduct_Fine[Deduct Fine from Coins]
        Deduct_Fine --> Check_Zero_Bal{Balance <= 0?}
        Check_Zero_Bal -- Yes --> Force_Return[Auto Return All Books]
        
        %% AI Features
        Browse_Books --> Smart_Search[AI Smart Search / Intent Analysis]
        Smart_Search --> Fetch_Results[Fetch Results]
    end

    subgraph Admin_Actions [Admin]
        Role_Check -- Admin --> Admin_Dashboard[Admin Dashboard]
        
        %% Admin Operations
        Admin_Dashboard --> Manage_Users[Manage Users]
        Manage_Users --> Block_User[Block / Unblock User]
        
        Admin_Dashboard --> Manage_Books[Manage Books]
        Manage_Books --> Add_Book[Add New Book]
        Add_Book --> Fetch_Meta[Fetch Metadata (ISBN/Google)]
        Fetch_Meta --> Save_Book[Save Book to DB]
        
        Manage_Books --> Edit_Book[Edit Existing Book]
        Manage_Books --> Delete_Book[Delete Book]
    end
    
    %% Cross System Links
    Role_Check -- User --> User_Dashboard
    Force_Return --> Release_Book
    Err_Coins --> User_Dashboard
    Err_Avail --> User_Dashboard
    Update_User_Client --> User_Dashboard
    
    %% Styles
    class Start terminus;
```
