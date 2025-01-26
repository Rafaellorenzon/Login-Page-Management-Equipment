from flask import Flask, render_template, request, redirect, url_for, session, jsonify, send_from_directory, send_file, make_response
import json
import os
from datetime import datetime 

app = Flask(__name__)
app.secret_key = 'your_secret_key'  #key

data_file = 'data.json'
location_file = 'static/location.json'
equipment_file = 'static/equipment.json'
history_file = 'history.json'  
damage_file = 'static/damage.json'


def load_data():
    if not os.path.exists(data_file):
        return {"users": []}
    with open(data_file, 'r') as file:
        return json.load(file)

def load_location():
    if not os.path.exists(location_file):
        return {"locations": []}
    with open(location_file, 'r') as file:
        return json.load(file)

def load_equipment():
    if not os.path.exists(equipment_file):
        return {"equipments": []}
    with open(equipment_file, 'r') as file:
        return json.load(file)

def load_history():
    if not os.path.exists(history_file):
        return []
    with open(history_file, 'r') as file:
        return json.load(file)

def save_data(data):
    with open(data_file, 'w') as file:
        json.dump(data, file, indent=4)

def save_history(history):
    with open(history_file, 'w') as file:
        json.dump(history, file, indent=4)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        data = load_data()
        users = data.get("users", [])
        
        for user in users:
            if user['username'] == username and user['password'] == password:
                session['logged_in'] = True
                session['username'] = username
                session['user_type'] = user.get('role', 'user').lower()
                
                if session['user_type'] == 'admin':
                    return redirect(url_for('index'))
                elif session['user_type'] == 'userbarcode':
                    return redirect(url_for('user_page')) 
                else:
                    return redirect(url_for('user_page'))
        
        return render_template('login.html', error="Invalid username or password")

    return render_template('login.html')


@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/get-logged-user', methods=['GET'])
def get_logged_user():
    if 'username' in session:
        response = jsonify({"username": session['username']})
        response.headers["Content-Type"] = "application/json; charset=utf-8"
        return response
    response = jsonify({"username": None})
    response.headers["Content-Type"] = "application/json; charset=utf-8"
    return response, 401

@app.route('/')
def index():
    if not session.get('logged_in') or session.get('user_type') != 'admin':
        return redirect(url_for('login'))

    data = load_data()
    users = data.get("users", [])

    users = [user for user in users if user['username'] != 'superuser']
    
    users.sort(key=lambda x: x['username'].lower())

    return render_template('index.html', users=users)

@app.route('/user')
def user_page():
    if not session.get('logged_in') or session.get('user_type') not in ['user', 'userbarcode']:
        return redirect(url_for('login'))

    data = load_data()
    users = data.get("users", [])
    
    current_user = session['username']
    current_user_data = next((user for user in users if user['username'] == current_user), None)

    equipment_name = current_user_data['equipment'] if current_user_data else None
    status = current_user_data['status'] if current_user_data else None
    location = current_user_data['location'] if current_user_data else None

    return render_template('user.html', current_equipment_name=equipment_name, status=status, current_location=location)

@app.route('/update-data', methods=['POST'])
def update_data():
    data = load_data()
    save_data(data)

    # Retorna JSON com charset=utf-8 no cabeçalho
    response = make_response(jsonify({"success": True}), 200)
    response.headers['Content-Type'] = 'application/json; charset=utf-8'
    return response


@app.route('/not-check-all', methods=['POST'])
def not_check_all():
    data = load_data()
    users = data.get("users", [])
    
    for user in users:
        user['status'] = 'Not Checked'
    
    save_data(data)
    add_history_entry(f"All equipment statuses set to Not Checked by {session['username']}.", session['user_type'])

    # Retorna JSON com charset=utf-8 no cabeçalho
    response = make_response(jsonify({"success": True}), 200)
    response.headers['Content-Type'] = 'application/json; charset=utf-8'
    return response


@app.route('/set-all-empty', methods=['POST'])
def set_all_to_empty():
    if not session.get('logged_in') or session.get('user_type') != 'admin':
        # Retorna erro com charset=utf-8
        response = make_response(jsonify({"error": "Unauthorized"}), 403)
        response.headers['Content-Type'] = 'application/json; charset=utf-8'
        return response

    data = load_data()
    users = data.get('users', [])

    for user in users:
        user['equipment'] = 'Empty'
        user['status'] = 'Not Checked'

    save_data(data)
    add_history_entry(f"All equipments set to Empty by {session['username']}.", session['user_type'])

    # Retorna sucesso com mensagem
    response = make_response(jsonify({
        "success": True,
        "message": "All equipments set to Empty!"
    }), 200)
    response.headers['Content-Type'] = 'application/json; charset=utf-8'
    return response

@app.route('/leave_equipment', methods=['POST'])
def leave_equipment():
    current_user = session.get('username') 
    if not current_user:
        return jsonify({"error": "User not logged in"}), 403

    data = load_data()
    users = data.get('users', [])

    for user in users:
        if user['username'] == current_user:
            user['equipment'] = 'Empty'
            user['status'] = 'Not Checked'
            break

    save_data(data)

    add_history_entry(f"{current_user} left their equipment.", session['user_type'])

    return jsonify({"message": "Equipment left successfully!"}), 200

@app.route('/change_status/<username>', methods=['POST'])
def change_status(username):
    data = load_data()
    users = data.get("users", [])
    
    for user in users:
        if user['username'] == username:
            current_status = user.get('status', 'Not Checked')
            new_status = 'Checked' if current_status == 'Not Checked' else 'Not Checked'
            user['status'] = new_status
            
            add_history_entry(f"{session['username']} changed status of {username} to {new_status}.", session['user_type'])
            break

    save_data(data)
    return redirect(url_for('index')) 

def add_history_entry(action, user_type):
    history = load_history()
    log_entry = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "user": session['username'],
        "action": action,
        "role": user_type
    }
    history.append(log_entry)
    save_history(history)

@app.route('/users')
def manage_users():
    data = load_data()
    users = data.get("users", [])
    users = [user for user in users if user['username'] != 'superuser']
    admins = [user for user in users if user['role'] == 'Admin']
    non_admins = [user for user in users if user['role'] not in ['Admin', 'Userbarcode']]
    userbarcodes = [user for user in users if user['role'] == 'Userbarcode']
    admins_sorted = sorted(admins, key=lambda x: x['username'].lower())
    userbarcodes_sorted = sorted(userbarcodes, key=lambda x: x['username'].lower())
    non_admins_sorted = sorted(non_admins, key=lambda x: x['username'].lower())
    sorted_users = admins_sorted + userbarcodes_sorted + non_admins_sorted

    return render_template('manage_users.html', users=sorted_users)

@app.route('/add_user', methods=['POST'])
def add_user():
    try:

        request_data = request.get_json()
        users = load_data().get("users", [])

        username = request_data.get("username")
        password = request_data.get("password")
        role = request_data.get("role")
        location = request_data.get("location")
        equipment = request_data.get("equipment", "")

        if not username or not location:
            return jsonify({"error": "Username e Location são obrigatórios."}), 400

        users.append({
            "username": username,
            "password": password,
            "role": role,
            "status": "Not Checked",
            "location": location,
            "equipment": equipment
        })

        data = load_data()
        data['users'] = users
        save_data(data)

        add_history_entry(f"User {username} added by {session['username']}.", session['user_type'])

        return jsonify({"message": "Usuário adicionado com sucesso!"}), 200

    except Exception as e:
        print("Erro ao adicionar usuário:", e)
        return jsonify({"error": "Erro ao salvar o usuário."}), 500



@app.route('/edit_user', methods=['POST'])
def edit_user():
    original_username = request.form.get('original_user')
    new_username = request.form.get('new_user')
    new_password = request.form.get('password')
    new_role = request.form.get('role')
    new_location = request.form.get('location')
    new_equipment = request.form.get('equipment')

    data = load_data()
    users = data.get("users", [])

    for user in users:
        if user['username'] == original_username:
            user['username'] = new_username
            user['password'] = new_password
            user['role'] = new_role
            user['location'] = new_location
            user['equipment'] = new_equipment
            
            
            add_history_entry(f"User {original_username} edited to {new_username} by {session['username']}.", session['user_type'])
            break

    data['users'] = users
    save_data(data)

    return redirect(url_for('manage_users')) 


@app.route('/remove_user/<username>', methods=['POST'])
def remove_user(username):
    data = load_data()
    users = data.get("users", [])
    data['users'] = [user for user in users if user['username'] != username]
    
    save_data(data)
    add_history_entry(f"User {username} removed by {session['username']}.", session['user_type'])

    return redirect(url_for('manage_users'))


@app.route('/add_equipment', methods=['POST'])
def add_equipment():
    data = load_equipment()  
    equipments = data.get("equipments", [])

    equipment_name = request.json.get('name')  

    if equipment_name:
        equipments.append({"name": equipment_name})  
        data['equipments'] = equipments 
        save_file(data, equipment_file) 

        add_history_entry(f"Equipment {equipment_name} added by {session['username']}.", session['user_type'])

    return jsonify({"success": True})  

@app.route('/add_location', methods=['POST'])
def add_location():
    data = load_location()  
    locations = data.get("locations", [])

    location_name = request.json.get('name')  

    if location_name:
        locations.append(location_name)  
        data['locations'] = locations
        save_file(data, location_file)

        add_history_entry(f"Location {location_name} added by {session['username']}.", session['user_type'])

    return jsonify({"success": True})  


@app.route('/remove_equipment/<int:index>', methods=['POST'])
def remove_equipment(index):
    data = load_equipment()  
    equipments = data.get("equipments", [])

    if 0 <= index < len(equipments):
        equipment_name = equipments[index]['name']  
        equipments.pop(index) 
        data['equipments'] = equipments  

        save_file(data, equipment_file) 
        add_history_entry(f"Equipment {equipment_name} removed by {session['username']}.", session['user_type'])
        
        return jsonify({"success": True})  
    return jsonify({"success": False, "message": "Index out of range"}), 400  


@app.route('/save-data', methods=['POST'])
def save_data_route():
    data = request.json
    current_user = session.get('username')

    existing_data = load_data()
    users = existing_data.get('users', [])
    
    user_found = False
    for user in users:
        if user['username'] == current_user:
            user['location'] = data.get('location', user['location'])
            user['equipment'] = data.get('equipment', user['equipment'])
            user['status'] = 'Checked'
            user_found = True
            
            add_history_entry(f"{current_user} performed the checklist on equipment {data.get('equipment')}.", session['user_type'])
            break

    if not user_found:
        new_user_data = {
            "username": current_user,
            "location": data.get('location'),
            "equipment": data.get('equipment'),
            "status": 'Checked'
        }
        users.append(new_user_data)

    existing_data['users'] = users
    save_data(existing_data)

    return jsonify({"message": "Data saved successfully!"}), 201


@app.route('/manage_data')
def manage_data():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('manage_data.html')

@app.route('/history')
def history():
    if not session.get('logged_in') or session.get('user_type') != 'admin':
        return redirect(url_for('login'))

    history = load_history() 
    return render_template('console.html', history=history) 


@app.route('/clear_history', methods=['POST'])
def clear_history():
    history = load_history() 
    if not history:
        return jsonify({"message": "No history to clear!"}), 200
    today = datetime.now().strftime("%Y-%m-%d")
    history_file_path = f'console/history_{today}.txt'
    
    os.makedirs('console', exist_ok=True)  
    
    with open(history_file_path, 'w') as file:
        for log in history:
            file.write(f"{log['timestamp']} - {log['user']} - {log['action']} ({log['role']})\n")


    save_history([])
    return jsonify({"message": "History cleared and saved successfully!", "file_name": f'history_{today}.txt'}), 200


@app.route('/download/<filename>')
def download_file(filename):
    return send_from_directory('console', filename, as_attachment=True)


@app.route('/add_<file_type>', methods=['POST'])
def add_entry(file_type):
    data = request.json.get('name')
    file_path = f'static/{file_type}.json'

    content = load_file(file_path)
    if file_type == 'equipment':
        content['equipments'].append({'name': data})
    else:
        content['locations'].append(data)

    save_file(content, file_path)
    return jsonify({'success': True})


@app.route('/edit_<file_type>', methods=['POST'])
def edit_entry(file_type):
    index = request.json.get('index')
    new_name = request.json.get('newName')
    file_path = f'static/{file_type}.json'

    content = load_file(file_path)
    if file_type == 'equipment':
        content['equipments'][index]['name'] = new_name
    else:
        content['locations'][index] = new_name

    save_file(content, file_path)
    return jsonify({'success': True})


@app.route('/remove_<file_type>/<int:index>', methods=['POST'])
def remove_entry(file_type, index):
    file_path = f'static/{file_type}.json'

    content = load_file(file_path)
    if file_type == 'equipment':
        content['equipments'].pop(index)
    else:
        content['locations'].pop(index)

    save_file(content, file_path)
    return jsonify({'success': True})


def load_file(file_path):
    with open(file_path, 'r') as file:
        return json.load(file)

def save_file(content, file_path):
    with open(file_path, 'w') as file:
        json.dump(content, file, indent=4)


@app.route('/available_equipments', methods=['GET'])
def available_equipments():
    data = load_equipment()
    users = load_data().get('users', [])
    
  
    used_equipments = {user['equipment'] for user in users if user['equipment'] and user['equipment'] != 'Empty'}
    available = [equipment for equipment in data['equipments'] if equipment['name'] not in used_equipments]
    
    return jsonify(available)


@app.route('/sorted_locations')
def sorted_locations():
    locations = load_location().get('locations', [])
    sorted_locations = sorted(locations)  
    return jsonify(sorted_locations)


@app.route('/sorted_equipments')
def sorted_equipments():
    equipments = load_equipment().get('equipments', [])
    sorted_equipments = sorted(equipments, key=lambda x: x['name'].lower()) 
    return jsonify(sorted_equipments)


@app.route('/damagesequipments')

def damaged_equipments():
    if not session.get('logged_in') or session.get('user_type') != 'admin':
        abort(403)  
    damaged_reports = load_damaged_equipments()  
    return render_template('damagesequipments.html', damaged_reports=damaged_reports)

def load_damaged_equipments():
    if not os.path.exists(damage_file):
        return []  
    with open(damage_file, 'r') as file:
        return json.load(file)  


@app.route('/remove_damage/<int:index>', methods=['DELETE'])
def remove_damage(index):
    damages = load_damaged_equipments()  

    if 0 <= index < len(damages):
        damages.pop(index)  
        with open(damage_file, 'w') as file:
            json.dump(damages, file, indent=4)
        return jsonify({"success": True})  

    return jsonify({"success": False, "message": "Index out of range"}), 400  


def load_damages():
    if not os.path.exists('static/damage.json'):
        return []
    with open('static/damage.json', 'r') as file:
        return json.load(file)

def save_damages(damage_data):
    with open('static/damage.json', 'w') as file:
        json.dump(damage_data, file, indent=4)


@app.route('/report-damage', methods=['POST'])
def report_damage():
    data = request.json
    damages = load_damages() 
    damages.append({
        "username": data['username'],
        "equipment": data['equipment'],
        "damages": data['damages'],
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })
    save_damages(damages) 

    return jsonify({"success": True, "message": "Damage report saved successfully!"}), 201


@app.route('/check_if_damaged', methods=['POST'])
def check_damaged_equipment():
    data = request.json
    equipment_name = data.get('equipment')  
    damages = load_damages()  

    for damage in damages:
        if damage['equipment'] == equipment_name:
            return jsonify({
                "damaged": True,
                "user": damage['username'],
                "date": damage['timestamp']
            })

    return jsonify({"damaged": False})

@app.route('/data.json')
def get_data():
    return send_file('data.json', mimetype='application/json')

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
