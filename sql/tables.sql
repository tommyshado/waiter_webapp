
CREATE TABLE waiter_registration (
    waiter_id serial not null primary key,
    waiter_name text unique not null,
    password int,
    -- differentiate between users with a role field
    role text not null
);
create table shifts (
    shift_id serial not null primary key,
    day text unique not null
);
CREATE TABLE availability (
    waiter_id int,
    foreign key (waiter_id) references waiter_registration(waiter_id) on delete cascade,
    waiter_shift text not null,
    foreign key (waiter_shift) references shifts(day) on delete cascade
);