module poker_addr::poker {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use std::option;
    use aptos_framework::table;

    // Errors
    const EINVALID_AMOUNT: u64 = 1;
    const EINSUFFICIENT_BALANCE: u64 = 2;
    const EGAME_ALREADY_ACTIVE: u64 = 3;
    const EUNAUTHORIZED: u64 = 4;
    const EGAME_NOT_FOUND: u64 = 5;

    struct GamePool has key {
        balance: coin::Coin<AptosCoin>,
        ai_address: address,
        games_played: u64,
        active_games: u64
    }

    const EVENT_DEPOSIT: u8 = 0;
    const EVENT_WITHDRAWAL: u8 = 1;
    const EVENT_GAME_START: u8 = 2;
    const EVENT_GAME_END: u8 = 3;
    const EVENT_PLAYER_WIN: u8 = 4;
    const EVENT_AI_WIN: u8 = 5;
    const EVENT_TIE: u8 = 6;

    #[event]
    struct GameEvent has drop, store {
        player: address,
        amount: u64,
        event_type: u8,
        game_id: option::Option<u64>
    }

    struct GameState has store, drop {
        player: address,
        pot_size: u64,
        status: u8,
        timestamp: u64
    }

    struct Games has key {
        games: table::Table<u64, GameState>
    }

    public fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        assert!(account_addr == @poker_addr, EUNAUTHORIZED);

        let pool = GamePool {
            balance: coin::zero<AptosCoin>(),
            ai_address: account_addr,
            games_played: 0,
            active_games: 0
        };
        move_to(account, pool);
        
        move_to(account, Games {
            games: table::new<u64, GameState>()
        });
    }

    public entry fun set_ai_address(
        admin: &signer,
        new_ai_address: address
    ) acquires GamePool {
        let admin_addr = signer::address_of(admin);
        assert!(admin_addr == @poker_addr, EUNAUTHORIZED);
        let pool = borrow_global_mut<GamePool>(@poker_addr);
        pool.ai_address = new_ai_address;
    }

    public entry fun deposit(
        player: &signer,
        amount: u64,
    ) acquires GamePool {
        assert!(amount > 0 && amount <= 2, EINVALID_AMOUNT);
        let player_addr = signer::address_of(player);
        let pool = borrow_global_mut<GamePool>(@poker_addr);
        
        let payment = coin::withdraw<AptosCoin>(player, amount);
        coin::merge(&mut pool.balance, payment);

        event::emit(GameEvent {
            player: player_addr,
            amount,
            event_type: EVENT_DEPOSIT,
            game_id: option::none()
        });
    }

    public entry fun withdraw(
        player: &signer,
        amount: u64,
    ) acquires GamePool {
        let player_addr = signer::address_of(player);
        let pool = borrow_global_mut<GamePool>(@poker_addr);
        let pool_balance = coin::value(&pool.balance);
        assert!(pool_balance >= amount, EINSUFFICIENT_BALANCE);
        
        let withdrawal = coin::extract(&mut pool.balance, amount);
        coin::deposit(player_addr, withdrawal);

        event::emit(GameEvent {
            player: player_addr,
            amount,
            event_type: EVENT_WITHDRAWAL,
            game_id: option::none()
        });
    }

    public entry fun start_game(
        player: &signer,
        initial_bet: u64
    ) acquires GamePool, Games {
        let player_addr = signer::address_of(player);
        let pool = borrow_global_mut<GamePool>(@poker_addr);
        let games = borrow_global_mut<Games>(@poker_addr);
        
        let game_id = pool.games_played + 1;
        pool.games_played = game_id;
        pool.active_games = pool.active_games + 1;
        
        table::add(&mut games.games, game_id, GameState {
            player: player_addr,
            pot_size: initial_bet * 2,
            status: 0,
            timestamp: timestamp::now_seconds()
        });
        
        event::emit(GameEvent {
            player: player_addr,
            amount: initial_bet,
            event_type: EVENT_GAME_START,
            game_id: option::some(game_id)
        });
    }
    
    public entry fun end_game(
        caller: &signer,
        game_id: u64,
        winner: u8,
        pot_amount: u64
    ) acquires GamePool, Games {
        let caller_addr = signer::address_of(caller);
        let pool = borrow_global_mut<GamePool>(@poker_addr);
        assert!(caller_addr == pool.ai_address || caller_addr == @poker_addr, EUNAUTHORIZED);
        
        let games = borrow_global_mut<Games>(@poker_addr);
        assert!(table::contains(&games.games, game_id), EGAME_NOT_FOUND);
        
        let game = table::borrow_mut(&mut games.games, game_id);
        assert!(game.status == 0, EGAME_ALREADY_ACTIVE);
        
        let player_addr = game.player;
        let event_type;
        let winner_addr;
        
        if (winner == 0) {
            game.status = 1;
            winner_addr = player_addr;
            event_type = EVENT_PLAYER_WIN;
            if (pot_amount > 0) {
                let transfer_amount = min_u64(pot_amount, coin::value(&pool.balance));
                let payment = coin::extract(&mut pool.balance, transfer_amount);
                coin::deposit(player_addr, payment);
            }
        } else if (winner == 1) {
            game.status = 2;
            winner_addr = pool.ai_address;
            event_type = EVENT_AI_WIN;
        } else {
            game.status = 3;
            winner_addr = player_addr;
            event_type = EVENT_TIE;
            let half_pot = pot_amount / 2;
            if (half_pot > 0) {
                let transfer_amount = min_u64(half_pot, coin::value(&pool.balance));
                let payment = coin::extract(&mut pool.balance, transfer_amount);
                coin::deposit(player_addr, payment);
            }
        };
        
        pool.active_games = pool.active_games - 1;
        
        event::emit(GameEvent {
            player: winner_addr,
            amount: pot_amount,
            event_type,
            game_id: option::some(game_id)
        });
    }

    public fun get_pool_info(): (u64, address, u64, u64) acquires GamePool {
        let pool = borrow_global<GamePool>(@poker_addr);
        let balance = coin::value(&pool.balance);
        (balance, pool.ai_address, pool.games_played, pool.active_games)
    }

    public fun min_u64(a: u64, b: u64): u64 {
        if (a < b) a else b
    }
}