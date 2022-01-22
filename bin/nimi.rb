require 'yaml'
require 'open-uri'
require 'json'

def create_json(urls, output)
	sin = {}
	urls.each do |url|
		yaml = YAML.load(URI.open(url).read)
		yaml.each do |nimi, mute|
			sin[nimi] = {}
			mute.each_with_index do |wan, index|
				tu = wan.split
				if tu[-1].to_i.to_s == tu[-1]
					nanpa = tu.pop.to_i
					sin[nimi][tu.join(' ')] = nanpa
				else
					mute[index + 1] = "#{wan}, #{mute[index + 1]}"
				end
			end
		end
	end
	File.write(output, JSON.generate(sin))
end

def reversed_json(urls, output)
	sin = {}
	urls.each do |url|
		yaml = YAML.load(URI.open(url).read)
		yaml.each do |nimi, mute|
			mute.each_with_index do |wan, index|
				tu = wan.split
				if tu[-1].to_i.to_s == tu[-1]
					nanpa = tu.pop.to_i
					sin[tu.join(' ')] = {} unless sin.has_key?(tu.join(' '))
					sin[tu.join(' ')][nimi] = nanpa
				else
					mute[index + 1] = "#{wan}, #{mute[index + 1]}"
				end
			end
		end
	end
	File.write(output, JSON.generate(sin))
end

create_json(['http://tokipona.org/nimi_pu.txt'], 'nanpa/nimi_pu.json')
create_json(['http://tokipona.org/nimi_pi_pu_ala.txt'], 'nanpa/nimi_pu_ala.json')
create_json(['http://tokipona.org/compounds.txt'], 'nanpa/compounds.json')

reversed_json(['http://tokipona.org/nimi_pu.txt', 'http://tokipona.org/nimi_pi_pu_ala.txt', 'http://tokipona.org/compounds.txt'], 'en-tp.json')
create_json(['http://tokipona.org/nimi_pu.txt', 'http://tokipona.org/nimi_pi_pu_ala.txt', 'http://tokipona.org/compounds.txt'], 'tp-en.json')
